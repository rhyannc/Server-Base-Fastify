import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'

import { FetchCompaniesUserId } from '../companies/fetch-companies-user-manager'

export function makeFindUserIdCompaniesUseCase() {
  const companiesRepository = new PrismaCompaniesRepository()
  const useCase = new FetchCompaniesUserId(companiesRepository)

  return useCase
}
