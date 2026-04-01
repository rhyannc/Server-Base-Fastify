import { Company } from '@prisma/client'

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
}

export class FetchCompaniesUseCase {
  constructor(private companiesRepository: CompaniesRepository) {}

  async execute({
    page,
  }: FetchCompaniesUseCaseRequest): Promise<FetchCompaniesUseCaseResponse> {
    const companies = ((await this.companiesRepository.findMany(page)) as CompanyWithManager[])

    return {
      companies,
    }
  }
}
