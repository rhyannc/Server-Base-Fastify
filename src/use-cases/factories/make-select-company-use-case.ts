import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'

import { SelectCompanyUseCase } from '../companies/select-company'

export function makeSelectCompanyUseCase() {
  const companiesRepository = new PrismaCompaniesRepository()
  const useCase = new SelectCompanyUseCase(companiesRepository)

  return useCase
}
