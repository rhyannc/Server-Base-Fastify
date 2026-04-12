import { Company, Role, Status } from '@prisma/client'

import { CompaniesRepository } from '@/repositories/companies-repository'

import { CompanyNoExistError } from '../errors/company-no-exist-error'
import { OnlyAdminAuthorizedError } from '../errors/only-admin-authorized-error'

interface ToggleCompanyStatusUseCaseRequest {
  id: string
  meId: string
  meSysRole: Role
}

interface ToggleCompanyStatusUseCaseResponse {
  company: Company
}

export class ToggleCompanyStatusUseCase {
  constructor(private companiesRepository: CompaniesRepository) {}

  async execute({
    id,
    meId,
    meSysRole,
  }: ToggleCompanyStatusUseCaseRequest): Promise<ToggleCompanyStatusUseCaseResponse> {
    const companyExists = await this.companiesRepository.findById(id)
    if (!companyExists) {
      throw new CompanyNoExistError()
    }

    // Somente o ADMIN ou o MANAGER da empresa podem alterar seu status.
    if (meSysRole !== 'ADMIN' && companyExists.managerId !== meId) {
      throw new OnlyAdminAuthorizedError()
    }

    // Determine o novo status(Toggle ACTIVE <-> FROZEN)
    let newStatus: Status
    if (companyExists.status === 'ACTIVE') {
      newStatus = 'FROZEN'
    } else if (companyExists.status === 'FROZEN') {
      newStatus = 'ACTIVE'
    } else {

      // Empresas ARCHIVED não podem ter seu status alterado por esta rota.
      if (companyExists.status === 'ARCHIVED') {
        throw new Error('Empresas arquivadas não podem ter seu status alterado por esta rota.')
      }
      newStatus = 'ACTIVE' // 
    }

    const company = await this.companiesRepository.update({
      id,
      status: newStatus,
    })

    return {
      company,
    }
  }
}
