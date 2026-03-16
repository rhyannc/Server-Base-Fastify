import { Company, Status } from '@prisma/client'

import { CompanysRepository } from '@/repositories/companies-repository'

interface UpdateCompanyUseCaseRequest {
  id: string
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

}

interface UpdateCompanyUseCaseResponse {
  company: Company
}

export class UpdateCompanyUseCase {
  constructor(private companysRepository: CompanysRepository) {}

  async execute({
    id,
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
 
  }: UpdateCompanyUseCaseRequest): Promise<UpdateCompanyUseCaseResponse> {
    const company = await this.companysRepository.update({
      id,
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

    })

    return {
      company,
    }
  }
}
