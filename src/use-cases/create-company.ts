import { Company, Status } from '@prisma/client'

import { CompanysRepository } from '@/repositories/companies-repository'

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
  constructor(private companysRepository: CompanysRepository) {}
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
    const companyWithsameCnpj = await this.companysRepository.findByCnpj(cnpj)

    if (companyWithsameCnpj) {
      throw new CompanyAlreadyExistsError()
    }

    // Cadastra no BD
    const company = await this.companysRepository.create({
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
