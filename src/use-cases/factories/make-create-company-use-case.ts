import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'

import { CreateCompanyUseCase } from '../companies/create-company'
import { makeCheckAndIncrementUsageUseCase } from './make-check-and-increment-usage-use-case'

export function makeCreateCompanyUseCase() {
  const companiesRepository = new PrismaCompaniesRepository()
  const checkAndIncrementUsageUseCase = makeCheckAndIncrementUsageUseCase()
  
  const createCompanyUseCase = new CreateCompanyUseCase(
    companiesRepository,
    checkAndIncrementUsageUseCase,
  )

  return createCompanyUseCase
}
