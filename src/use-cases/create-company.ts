import { Company, Status, UsageMetric } from '@prisma/client'

import { CompaniesRepository } from '@/repositories/companies-repository'

import { CheckAndIncrementUsageUseCase } from './check-and-increment-usage'
import { CompanyAlreadyExistsError } from './errors/company-already-exists-error'

interface CreateCompanyUseCaseRequest {
  name: string
  cnpj?: string | null
  email?: string | null
  phone?: string | null
  country?: string | null
  city?: string | null
  state?: string | null
  address?: string | null
  number?: string | null
  complement?: string | null
  cep?: string | null
  createdBy?: string | null
  active?: boolean
  status?: Status
  managerId: string
}

interface CreateCompanyUseCaseResponse {
  company: Company
}

export class CreateCompanyUseCase {
  constructor(
    private companiesRepository: CompaniesRepository,
    private checkAndIncrementUsageUseCase: CheckAndIncrementUsageUseCase,
  ) {}
  async execute({
    name,
    cnpj,
    email,
    phone,
    country,
    city,
    state,
    address,
    number,
    complement,
    cep,
    createdBy,
    active,
    status,
    managerId,
  }: CreateCompanyUseCaseRequest): Promise<CreateCompanyUseCaseResponse> {
    // Validar se CNPJ ja existe
    const companyWithsameCnpj = await this.companiesRepository.findByCnpj(cnpj)

    if (companyWithsameCnpj) {
      throw new CompanyAlreadyExistsError()
    }

    // Verifica limite do plano e incrementa o uso
    await this.checkAndIncrementUsageUseCase.execute({
      userId: managerId,
      metric: UsageMetric.COMPANIES,
    })

    // Cadastra no BD
    const company = await this.companiesRepository.create({
      name,
      cnpj,
      email,
      phone,
      country,
      city,
      state,
      address,
      number,
      complement,
      cep,
      createdBy,
      active,
      status,
      managerId,
    })

    return { company } // Retorna a company criada
  }
}
