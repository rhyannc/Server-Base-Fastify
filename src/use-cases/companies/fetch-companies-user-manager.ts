import { Company } from '@prisma/client'

import { env } from '@/env'
import { CompaniesRepository } from '@/repositories/companies-repository'

interface FetchCompanyUseCaseRequest {
  userId: string
  page: number
}

interface FetchCompanyUseCaseResponse {
  company: Company[]
  meta: {
    totalCount: number
    pageIndex: number
    perPage: number
    totalPages: number
  }
}

export class FetchCompaniesUserId {
  constructor(private companiesRepository: CompaniesRepository) {}

  async execute({
    userId,
    page,
  }: FetchCompanyUseCaseRequest): Promise<FetchCompanyUseCaseResponse> {
    const [company, totalCount] = await this.companiesRepository.findManyByUserManager(
      userId,
      page,
    )

    const totalPages = Math.ceil(totalCount / env.TAKE_PAGINATION)

    return {
      company,
      meta: {
        totalCount,
        pageIndex: page,
        perPage: env.TAKE_PAGINATION,
        totalPages,
      },
    }
  }
}
