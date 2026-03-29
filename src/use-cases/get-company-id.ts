import { Company } from '@prisma/client'

import { CompaniesRepository } from '@/repositories/companies-repository'

import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface GetCompanyIdUseCaseRequest {
  companyId: string
}

interface GetCompanyIdUseCaseResponse {
  company: Company
}

export class GetCompanyIdUseCase {
  constructor(private companiesRepository: CompaniesRepository) {}

  async execute({
    companyId,
  }: GetCompanyIdUseCaseRequest): Promise<GetCompanyIdUseCaseResponse> {
    // Confere id esta no BD
    const company = await this.companiesRepository.findById(companyId)

    if (!company) {
      throw new ResourceNotFoundError()
    }

    // Atualiza o lastAccess ao entrar na empresa
    await this.companiesRepository.update({
      id: companyId,
      lastAccess: new Date(),
    })

    return { company }
  }
}
