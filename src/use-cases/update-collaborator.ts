import { Collaborator, Role, RoleCollaborator, Status } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'

import { GenericUnauthorizedError } from './errors/generic-unauthorized-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface UpdateCollaboratorUseCaseRequest {
  collaboratorId: string
  role?: RoleCollaborator
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
    meId,
    meSysRole,
    role,
    active,
    status,
  }: UpdateCollaboratorUseCaseRequest & {
    meId: string
    meSysRole: Role
  }): Promise<UpdateCollaboratorUseCaseResponse> {
    //  Verifica se o COLABORADOR existe
    const collaborator =
      await this.collaboratorsRepository.findById(collaboratorId)

    if (!collaborator) {
      throw new ResourceNotFoundError()
    }

    // Verifica se a empresa existe
    const company = await this.companiesRepository.findById(
      collaborator.companyId,
    )
    if (!company) {
      throw new ResourceNotFoundError()
    }

    //  Validação de Permissão (ADMIN ou Manager da Empresa)
    if (meSysRole !== 'ADMIN' && company.managerId !== meId) {
      // Verifica se sou um colaborador com role LEAD nessa empresa

      const authorCollaborator =
        await this.collaboratorsRepository.findByCompanyAndUser(
          collaborator.companyId,
          meId,
        )
      if (!authorCollaborator || authorCollaborator.role !== 'LEAD') {
        throw new GenericUnauthorizedError()
      }
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
