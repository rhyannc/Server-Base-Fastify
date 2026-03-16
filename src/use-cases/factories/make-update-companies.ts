import { PrismaCompanysRepository } from '@/repositories/prisma/prisma-companys-respository'

import { UpdateCompanyUseCase } from '../update-company'

export function makeUpdateCompaniesUseCase() {
  const companysRepository = new PrismaCompanysRepository()
  const useCase = new UpdateCompanyUseCase(companysRepository)
                      
  return useCase
}
