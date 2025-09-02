import { PrismaCompanysRepository } from '@/repositories/prisma/prisma-companys-respository'

import { SearchCompanysUseCase } from '../search-companys'

export function makeSeachCompanysUseCase() {
  const companysRepository = new PrismaCompanysRepository()
  const useCase = new SearchCompanysUseCase(companysRepository)

  return useCase
}
