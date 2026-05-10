import { Collaborator, Role } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'
import { env } from '@/env'

import { GenericUnauthorizedError } from '../errors/generic-unauthorized-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface SearchCollaboratorsByCompanyUseCaseRequest {
  companyId: string
  query: string
  page: number
  meId: string
  meSysRole: Role
}

interface SearchCollaboratorsByCompanyUseCaseResponse {
  collaborators: Collaborator[]
  meta: {
    totalCount: number
    pageIndex: number
    perPage: number
    totalPages: number
  }
}

export class SearchCollaboratorsByCompanyUseCase {
  constructor(
    private collaboratorsRepository: CollaboratorsRepository,
    private companiesRepository: CompaniesRepository,
  ) {}

  async execute({
    companyId,
    query,
    page,
    meId,
    meSysRole,
  }: SearchCollaboratorsByCompanyUseCaseRequest): Promise<SearchCollaboratorsByCompanyUseCaseResponse> {
    // 1. Verifica se a empresa existe
    const company = await this.companiesRepository.findById(companyId)
    if (!company) {
      throw new ResourceNotFoundError()
    }

    // 2. Validação de Permissão (ADMIN ou Manager da Empresa ou LEAD de Colaboradores)
    if (meSysRole !== 'ADMIN' && company.managerId !== meId) {
      const authorCollaborator =
        await this.collaboratorsRepository.findByCompanyAndUser(companyId, meId)
      if (!authorCollaborator || authorCollaborator.role !== 'LEAD') {
        throw new GenericUnauthorizedError()
      }
    }

    // 3. Busca os colaboradores que casam com a query (nome ou email)
    const [collaborators, totalCount] = await Promise.all([
      this.collaboratorsRepository.searchManyByCompany(companyId, query, page),
      this.collaboratorsRepository.countSearchByCompany(companyId, query),
    ])

    const totalPages = Math.ceil(totalCount / env.TAKE_PAGINATION)

    return {
      collaborators,
      meta: {
        totalCount,
        pageIndex: page,
        perPage: env.TAKE_PAGINATION,
        totalPages,
      },
    }
  }
}
