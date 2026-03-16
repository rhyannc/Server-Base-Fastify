import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'

import { GetCompanyIdUseCase } from '../get-company-id'

export function makeGetCompanyidUseCase() {
  const companiesRepository = new PrismaCompaniesRepository()
  const useCase = new GetCompanyIdUseCase(companiesRepository)

  return useCase
}
