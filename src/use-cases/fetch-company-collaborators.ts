import { Collaborator, Role } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'

import { GenericUnauthorizedError } from './errors/generic-unauthorized-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface FetchCompanyCollaboratorsUseCaseRequest {
  companyId: string
  page: number
}

interface FetchCompanyCollaboratorsUseCaseResponse {
  collaborators: Collaborator[]
}

export class FetchCompanyCollaboratorsUseCase {
  constructor(
    private collaboratorsRepository: CollaboratorsRepository,
    private companiesRepository: CompaniesRepository,
  ) {}

  async execute({
    companyId,
    meId,
    meSysRole,
    page,
  }: FetchCompanyCollaboratorsUseCaseRequest & {
    meId: string
    meSysRole: Role
  }): Promise<FetchCompanyCollaboratorsUseCaseResponse> {
    // Verifica se a empresa existe
    const company = await this.companiesRepository.findById(companyId)
    if (!company) {
      throw new ResourceNotFoundError()
    }
    console.log(company)

    // Validação de Permissão (ADMIN ou Manager da Empresa)
    if (meSysRole !== 'ADMIN' && company.managerId !== meId) {
      // Verifica se EU sou um colaborador com role LEAD nessa empresa

      const authorCollaborator =
        await this.collaboratorsRepository.findByCompanyAndUser(companyId, meId)
      if (!authorCollaborator || authorCollaborator.role !== 'LEAD') {
        throw new GenericUnauthorizedError()
      }
    }

    const collaborators = await this.collaboratorsRepository.findManyByCompany(
      companyId,
      page,
    )

    return { collaborators }
  }
}
