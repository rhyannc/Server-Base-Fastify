import { Company } from '@prisma/client'

import { CompanysRepository } from '@/repositories/companies-repository'

import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface GetCompanyIdUseCaseRequest {
  companyId: string
}

interface GetCompanyIdUseCaseResponse {
  company: Company
}

export class GetCompanyIdUseCase {
  constructor(private companysRepository: CompanysRepository) {}

  async execute({
    companyId,
  }: GetCompanyIdUseCaseRequest): Promise<GetCompanyIdUseCaseResponse> {
    // Confere email esta no BD
    const company = await this.companysRepository.findById(companyId)

    if (!company) {
      throw new ResourceNotFoundError()
    }

    return { company }
  }
}
