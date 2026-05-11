import { Company } from '@prisma/client'

import { env } from '@/env'
import { CompaniesRepository } from '@/repositories/companies-repository'

// Interface local para estender a Company
interface CompanyWithManager extends Company {
  manager: {
    name: string
  }
}

interface SearchCompaniesUseCaseRequest {
  query: string
  page: number
}

interface SearchCompaniesUseCaseResponse {
  company: Company[]
  meta: {
    totalCount: number
    pageIndex: number
    perPage: number
    totalPages: number
  }
}

export class SearchCompaniesUseCase {
  constructor(private companiesRepository: CompaniesRepository) {}

  async execute({
    query,
    page,
  }: SearchCompaniesUseCaseRequest): Promise<SearchCompaniesUseCaseResponse> {
    const [companiesList, totalCount] = await this.companiesRepository.searchMany(
      query,
      page,
    )

    const company = companiesList as CompanyWithManager[]
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
