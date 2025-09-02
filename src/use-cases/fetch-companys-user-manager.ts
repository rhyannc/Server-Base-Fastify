import { Company } from '@prisma/client'

import { CompanysRepository } from '@/repositories/companys-repository'

interface FetchCompanyUseCaseRequest {
  userId: string
  page: number
}

interface FetchCompanyUseCaseResponse {
  company: Company[]
}

export class FetchCompanysUserId {
  constructor(private companysRepository: CompanysRepository) {}

  async execute({
    userId,
    page,
  }: FetchCompanyUseCaseRequest): Promise<FetchCompanyUseCaseResponse> {
    const company = await this.companysRepository.findManyByUserManager(
      userId,
      page,
    )

    return { company }
  }
}
