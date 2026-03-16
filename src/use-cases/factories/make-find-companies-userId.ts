import { PrismaCompanysRepository } from '@/repositories/prisma/prisma-companys-respository'

import { FetchCompanysUserId } from '../fetch-companies-user-manager'

export function makeFindUserIdCompaniesUseCase() {
  const companysRepository = new PrismaCompanysRepository()
  const useCase = new FetchCompanysUserId(companysRepository)

  return useCase
}
