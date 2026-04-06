import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'
import { PrismaUserSubscriptionsRepository } from '@/repositories/prisma/prisma-user-subscriptions-repository'

import { CreateCompanyUseCase } from '../companies/create-company'
import { makeCheckAndIncrementUsageUseCase } from './make-check-and-increment-usage-use-case'

export function makeCreateCompanyUseCase() {
  const companiesRepository = new PrismaCompaniesRepository()
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()
  const checkAndIncrementUsageUseCase = makeCheckAndIncrementUsageUseCase()
  
  const createCompanyUseCase = new CreateCompanyUseCase(
    companiesRepository,
    userSubscriptionsRepository,
    checkAndIncrementUsageUseCase,
  )

  return createCompanyUseCase
}
