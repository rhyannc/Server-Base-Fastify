import { Company } from '@prisma/client'

import { CompaniesRepository } from '@/repositories/companies-repository'

import { CompanyNotActiveError } from '../errors/company-not-active-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface SelectCompanyUseCaseRequest {
  companyId: string
}

interface SelectCompanyUseCaseResponse {
  company: Company
}

export class SelectCompanyUseCase {
  constructor(private companiesRepository: CompaniesRepository) {}

  async execute({
    companyId,
  }: SelectCompanyUseCaseRequest): Promise<SelectCompanyUseCaseResponse> {
    const company = await this.companiesRepository.findById(companyId)

    // Verifica se a empresa existe
    if (!company) {
      throw new ResourceNotFoundError()
    }

    // Verifica se a empresa esta ativa
    if (company.status !== 'ACTIVE') {
      throw new CompanyNotActiveError()
    }

    const updatedCompany = await this.companiesRepository.update({
      id: companyId,
      lastAccess: new Date(),
    })

    return { company: updatedCompany }
  }
}
