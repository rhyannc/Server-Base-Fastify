import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'

import { ToggleCompanyStatusUseCase } from '../companies/toggle-company-status'

export function makeToggleCompanyStatusUseCase() {
  const companiesRepository = new PrismaCompaniesRepository()
  const useCase = new ToggleCompanyStatusUseCase(companiesRepository)

  return useCase
}
