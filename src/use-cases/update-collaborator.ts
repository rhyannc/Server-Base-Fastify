import { Collaborator, Role, Status } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'

import { GenericUnauthorizedError } from './errors/generic-unauthorized-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface UpdateCollaboratorUseCaseRequest {
  collaboratorId: string
  role?: Role
  active?: boolean
  status?: Status
}

interface UpdateCollaboratorUseCaseResponse {
  collaborator: Collaborator
}

export class UpdateCollaboratorUseCase {
  constructor(
    private collaboratorsRepository: CollaboratorsRepository,
    private companiesRepository: CompaniesRepository,
  ) {}

  async execute({
    collaboratorId,
    authorId,
    authorRole,
    role,
    active,
    status,
  }: UpdateCollaboratorUseCaseRequest & {
    authorId: string
    authorRole: Role
  }): Promise<UpdateCollaboratorUseCaseResponse> {
    const collaborator =
      await this.collaboratorsRepository.findById(collaboratorId)

    if (!collaborator) {
      throw new ResourceNotFoundError()
    }

    const company = await this.companiesRepository.findById(
      collaborator.companyId,
    )
    if (!company) {
      throw new ResourceNotFoundError()
    }

    if (authorRole !== 'ADMIN' && company.managerId !== authorId) {
      throw new GenericUnauthorizedError()
    }

    const updatedCollaborator = await this.collaboratorsRepository.update({
      id: collaboratorId,
      role: role ?? collaborator.role,
      active: active ?? collaborator.active,
      status: status ?? collaborator.status,
    })

    return { collaborator: updatedCollaborator }
  }
}
