import {
  Collaborator,
  Role,
  RoleCollaborator,
  UsageMetric,
} from '@prisma/client'

import { IMailProvider } from '@/providers/mail/IMailProvider'
import { collaboratorInviteTemplate } from '@/providers/mail/templates/collaborator-invite'
import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'
import { UsersRepository } from '@/repositories/users-repository'

import { CollaboratorAlreadyExistsError } from '../errors/collaborator-already-exists-error'
import { GenericUnauthorizedError } from '../errors/generic-unauthorized-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { CheckAndIncrementUsageUseCase } from '../usages/check-and-increment-usage'

interface CreateCollaboratorUseCaseRequest {
  companyId: string
  email: string
  role?: RoleCollaborator
}

interface CreateCollaboratorUseCaseResponse {
  collaborator: Collaborator
}

export class CreateCollaboratorUseCase {
  constructor(
    private collaboratorsRepository: CollaboratorsRepository,
    private companiesRepository: CompaniesRepository,
    private usersRepository: UsersRepository,
    private checkAndIncrementUsageUseCase: CheckAndIncrementUsageUseCase,
    private mailProvider: IMailProvider,
  ) {}

  async execute({
    companyId,
    email,
    meId,
    meSysRole,
    role,
  }: CreateCollaboratorUseCaseRequest & {
    meId: string
    meSysRole: Role
  }): Promise<CreateCollaboratorUseCaseResponse> {
    // 1. Verifica se a empresa existe
    const company = await this.companiesRepository.findById(companyId)
    if (!company) {
      throw new ResourceNotFoundError()
    }

    // 2. Verifica se o usuário a ser adicionado existe
    const user = await this.usersRepository.findByEmail(email)
    if (!user) {
      throw new ResourceNotFoundError()
    }

    // 3. Validação de Permissão (ADMIN ou Manager da Empresa ou LEAD de Colaboradores)
    if (meSysRole !== 'ADMIN' && company.managerId !== meId) {
      // Verifica se EU sou um colaborador com role LEAD nessa empresa

      const authorCollaborator =
        await this.collaboratorsRepository.findByCompanyAndUser(companyId, meId)
      if (!authorCollaborator || authorCollaborator.role !== 'LEAD') {
        throw new GenericUnauthorizedError()
      }
    }

    // 4. Verifica se o usuário já é colaborador desta empresa
    const collaboratorExists =
      await this.collaboratorsRepository.findByCompanyAndUser(
        companyId,
        user.id,
      )

    if (collaboratorExists) {
      throw new CollaboratorAlreadyExistsError()
    }

    // Verifica limite do plano e Incrementa limite de uso de colaboradores da empresa (do Manager)
    await this.checkAndIncrementUsageUseCase.execute({
      userId: company.managerId,
      metric: UsageMetric.COLLABORATORS,
    })

    // 4. Cria o colaborador
    const collaborator = await this.collaboratorsRepository.create({
      companyId,
      userId: user.id,
      role,
    })

    // Envia o e-mail de convite
    await this.mailProvider.sendMail({
      to: user.email,
      subject: `Você foi adicionado à empresa ${company.name}`,
      body: collaboratorInviteTemplate({
        userName: user.name,
        companyName: company.name,
      }),
    })

    return { collaborator }
  }
}
