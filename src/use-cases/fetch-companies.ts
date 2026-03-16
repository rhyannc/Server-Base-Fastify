import { Company } from '@prisma/client'

import { CompanysRepository } from '@/repositories/companies-repository'

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
  constructor(private companysRepository: CompanysRepository) {}

  async execute({
    page,
  }: FetchCompaniesUseCaseRequest): Promise<FetchCompaniesUseCaseResponse> {
    const companies = ((await this.companysRepository.findMany(page)) as CompanyWithManager[])

    return {
      companies,
    }
  }
}
