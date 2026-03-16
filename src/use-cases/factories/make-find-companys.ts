import { PrismaCompanysRepository } from '@/repositories/prisma/prisma-companys-respository'

import { FetchCompaniesUseCase } from '../fetch-companies'

export function makeFindCompaniesUseCase() {
  const companysRepository = new PrismaCompanysRepository()
  const useCase = new FetchCompaniesUseCase(companysRepository)
                      
  return useCase
}
