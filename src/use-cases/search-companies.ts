import { Company } from '@prisma/client'

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
}

export class SearchCompaniesUseCase {
  constructor(private companiesRepository: CompaniesRepository) {}

  async execute({
    query,
    page,
  }: SearchCompaniesUseCaseRequest): Promise<SearchCompaniesUseCaseResponse> {
    const company = (await this.companiesRepository.searchMany(
      query,
      page,
    )) as CompanyWithManager[]

    return {
      company,
    }
  }
}
