import { PrismaCompanysRepository } from '@/repositories/prisma/prisma-companys-respository'

import { FetchCompanysUserId } from '../fetch-companys-user-manager'

export function makeFindUserIdCompanysUseCase() {
  const companysRepository = new PrismaCompanysRepository()
  const useCase = new FetchCompanysUserId(companysRepository)

  return useCase
}
