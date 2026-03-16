import { Company } from '@prisma/client'

import { CompanysRepository } from '@/repositories/companies-repository'

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
    const company = await this.companysRepository.searchMany(query, page)

    return {
      company,
    }
  }
}
