import { Company } from '@prisma/client'

import { companysRepository } from '@/repositories/companys-repository'

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
  managerId: string
}

interface CreateCompanyUseCaseResponse {
  company: Company
}

export class CreateCompanyUseCase {
  constructor(private companysRepository: companysRepository) {}
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
      managerId,
    })

    return { company } // Retorna a company criada
  }
}
