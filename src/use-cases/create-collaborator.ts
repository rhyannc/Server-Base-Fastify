import { Collaborator, Role, Status } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'
import { UsersRepository } from '@/repositories/users-repository'

import { CollaboratorAlreadyExistsError } from './errors/collaborator-already-exists-error'
import { GenericUnauthorizedError } from './errors/generic-unauthorized-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface CreateCollaboratorUseCaseRequest {
  companyId: string
  userId: string
  role?: Role
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
  ) {}

  async execute({
    companyId,
    userId,
    authorId,
    authorRole,
    role,
    active,
    status,
  }: CreateCollaboratorUseCaseRequest & { authorId: string; authorRole: Role }): Promise<CreateCollaboratorUseCaseResponse> {
    // 1. Verifica se a empresa existe
    const company = await this.companiesRepository.findById(companyId)
    if (!company) {
      throw new ResourceNotFoundError()
    }

    // 2. Validação de Permissão (ADMIN ou Gerente da Empresa)
    if (authorRole !== 'ADMIN' && company.managerId !== authorId) {
      throw new GenericUnauthorizedError()
    }

    // 2. Verifica se o usuário existe
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      throw new ResourceNotFoundError()
    }

    // 3. Verifica se o usuário já é colaborador desta empresa
    const collaboratorExists =
      await this.collaboratorsRepository.findByCompanyAndUser(companyId, userId)

    if (collaboratorExists) {
      throw new CollaboratorAlreadyExistsError()
    }

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
