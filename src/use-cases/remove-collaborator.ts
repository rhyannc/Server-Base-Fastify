import { Role } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'

import { GenericUnauthorizedError } from './errors/generic-unauthorized-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface RemoveCollaboratorUseCaseRequest {
  collaboratorId: string
}

export class RemoveCollaboratorUseCase {
  constructor(
    private collaboratorsRepository: CollaboratorsRepository,
    private companiesRepository: CompaniesRepository,
  ) {}

  async execute({
    collaboratorId,
    authorId,
    authorRole,
  }: RemoveCollaboratorUseCaseRequest & {
    authorId: string
    authorRole: Role
  }): Promise<void> {
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

    await this.collaboratorsRepository.delete(collaboratorId)
  }
}
