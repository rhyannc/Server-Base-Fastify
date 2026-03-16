import { Company } from '@prisma/client'

import { CompanysRepository } from '@/repositories/companies-repository'

// Interface local para estender a Company
interface CompanyWithManager extends Company {
  manager: {
    name: string
  }
}

interface SearchCompanysUseCaseRequest {
  query: string
  page: number
}

interface SearchCompanysUseCaseResponse {
  company: Company[]
}

export class SearchCompanysUseCase {
  constructor(private companysRepository: CompanysRepository) {}

  async execute({
    query,
    page,
  }: SearchCompanysUseCaseRequest): Promise<SearchCompanysUseCaseResponse> {
    const company = (await this.companysRepository.searchMany(
      query,
      page,
    )) as CompanyWithManager[]

    return {
      company,
    }
  }
}
