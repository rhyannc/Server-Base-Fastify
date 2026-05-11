import { Collaborator } from '@prisma/client'

import { env } from '@/env'
import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'

interface FetchUserCompaniesUseCaseRequest {
  userId: string
  page: number
}

interface FetchUserCompaniesUseCaseResponse {
  collaborators: Collaborator[]
  meta: {
    totalCount: number
    pageIndex: number
    perPage: number
    totalPages: number
  }
}

export class FetchUserCompaniesUseCase {
  constructor(
    private collaboratorsRepository: CollaboratorsRepository,
    private companiesRepository: CompaniesRepository,
  ) {}

  async execute({
    userId,
    page,
  }: FetchUserCompaniesUseCaseRequest): Promise<FetchUserCompaniesUseCaseResponse> {
    const [collaborators, totalCount] =
      await this.collaboratorsRepository.findManyByUser(userId, page)

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
