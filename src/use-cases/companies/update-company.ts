import { Company, Role } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'

import { CompanyNoExistError } from '../errors/company-no-exist-error'
import { GenericUnauthorizedError } from '../errors/generic-unauthorized-error'

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
  constructor(
    private companiesRepository: CompaniesRepository,
    private collaboratorsRepository: CollaboratorsRepository,
  ) {}

  async execute({
    meId,
    meSysRole,
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
  }: UpdateCompanyUseCaseRequest & {
    meId: string
    meSysRole: Role
  }): Promise<UpdateCompanyUseCaseResponse> {
    // Verifica se a empresa existe
    const companyExists = await this.companiesRepository.findById(id)
    if (!companyExists) {
      throw new CompanyNoExistError()
    }

    //  Validação de Permissão (ADMIN ou Manager da Empresa)
    if (meSysRole !== 'ADMIN' && companyExists.managerId !== meId) {
      // Verifica se sou um colaborador com role LEAD nessa empresa

      const authorCollaborator =
        await this.collaboratorsRepository.findByCompanyAndUser(id, meId)
      if (!authorCollaborator || authorCollaborator.role !== 'LEAD') {
        throw new GenericUnauthorizedError()
      }
    }

    const company = await this.companiesRepository.update({
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
