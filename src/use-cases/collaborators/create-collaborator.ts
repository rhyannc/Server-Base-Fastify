import {
  Collaborator,
  Role,
  RoleCollaborator,
  Status,
  UsageMetric,
} from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'
import { UsersRepository } from '@/repositories/users-repository'

import { CheckAndIncrementUsageUseCase } from '../usages/check-and-increment-usage'
import { CollaboratorAlreadyExistsError } from '../errors/collaborator-already-exists-error'
import { GenericUnauthorizedError } from '../errors/generic-unauthorized-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface CreateCollaboratorUseCaseRequest {
  companyId: string
  userId: string
  role?: RoleCollaborator
  active?: boolean
  status?: Status
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
  ) {}

  async execute({
    companyId,
    userId,
    meId,
    meSysRole,
    role,
    active,
    status,
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
    const user = await this.usersRepository.findById(userId)
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
      await this.collaboratorsRepository.findByCompanyAndUser(companyId, userId)

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
      userId,
      role,
      active,
      status,
    })

    return { collaborator }
  }
}
