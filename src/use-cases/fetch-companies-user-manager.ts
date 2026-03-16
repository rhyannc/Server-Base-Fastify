import { Company } from '@prisma/client'

import { CompaniesRepository } from '@/repositories/companies-repository'

interface FetchCompanyUseCaseRequest {
  userId: string
  page: number
}

interface FetchCompanyUseCaseResponse {
  company: Company[]
}

export class FetchCompaniesUserId {
  constructor(private companiesRepository: CompaniesRepository) {}

  async execute({
    userId,
    page,
  }: FetchCompanyUseCaseRequest): Promise<FetchCompanyUseCaseResponse> {
    const company = await this.companiesRepository.findManyByUserManager(
      userId,
      page,
    )

    return { company }
  }
}
