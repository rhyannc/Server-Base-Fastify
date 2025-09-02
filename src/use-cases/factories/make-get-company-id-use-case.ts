import { PrismaCompanysRepository } from '@/repositories/prisma/prisma-companys-respository'

import { GetCompanyIdUseCase } from '../get-company-id'

export function makeGetCompanyidUseCase() {
  const companysRepository = new PrismaCompanysRepository()
  const useCase = new GetCompanyIdUseCase(companysRepository)

  return useCase
}
