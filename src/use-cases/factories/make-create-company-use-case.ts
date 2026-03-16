import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'

import { CreateCompanyUseCase } from '../create-company'

export function makeCreateCompanyUseCase() {
  const companiesRepository = new PrismaCompaniesRepository()
  const createCompanyUseCase = new CreateCompanyUseCase(
    companiesRepository,
  )

  return createCompanyUseCase
}
