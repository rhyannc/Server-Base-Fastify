import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'

import { SearchCompaniesUseCase } from '../search-companies'

export function makeSearchCompaniesUseCase() {
  const companiesRepository = new PrismaCompaniesRepository()
  const useCase = new SearchCompaniesUseCase(companiesRepository)

  return useCase
}
