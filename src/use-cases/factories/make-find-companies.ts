import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'

import { FetchCompaniesUseCase } from '../fetch-companies'

export function makeFindCompaniesUseCase() {
  const companiesRepository = new PrismaCompaniesRepository()
  const useCase = new FetchCompaniesUseCase(companiesRepository)
                      
  return useCase
}
