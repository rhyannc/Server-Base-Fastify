import { Company } from '@prisma/client'

import { env } from '@/env'
import { CompaniesRepository } from '@/repositories/companies-repository'

// Interface local para estender a Company
interface CompanyWithManager extends Company {
  manager: {
    name: string
  }
}


interface FetchCompaniesUseCaseRequest {
  page: number
}

interface FetchCompaniesUseCaseResponse {
  companies: Company[]
  meta: {
    totalCount: number
    pageIndex: number
    perPage: number
    totalPages: number
  }
}

export class FetchCompaniesUseCase {
  constructor(private companiesRepository: CompaniesRepository) {}

  async execute({
    page,
  }: FetchCompaniesUseCaseRequest): Promise<FetchCompaniesUseCaseResponse> {
    const [companiesList, totalCount] = await this.companiesRepository.findMany(page)

    const companies = companiesList as CompanyWithManager[]
    const totalPages = Math.ceil(totalCount / env.TAKE_PAGINATION)

    return {
      companies,
      meta: {
        totalCount,
        pageIndex: page,
        perPage: env.TAKE_PAGINATION,
        totalPages,
      },
    }
  }
}
