import { PrismaCompanysRepository } from '@/repositories/prisma/prisma-companys-respository'

import { SearchCompanysUseCase } from '../search-companies'

export function makeSearchCompaniesUseCase() {
  const companysRepository = new PrismaCompanysRepository()
  const useCase = new SearchCompanysUseCase(companysRepository)

  return useCase
}
