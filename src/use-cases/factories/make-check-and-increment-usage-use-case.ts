import { PrismaPlansRepository } from '@/repositories/prisma/prisma-plans-repository'
import { PrismaUsagesRepository } from '@/repositories/prisma/prisma-usages-repository'
import { PrismaUserSubscriptionsRepository } from '@/repositories/prisma/prisma-user-subscriptions-repository'

import { CheckAndIncrementUsageUseCase } from '../usages/check-and-increment-usage'

export function makeCheckAndIncrementUsageUseCase() {
  const usagesRepository = new PrismaUsagesRepository()
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()
  const plansRepository = new PrismaPlansRepository()

  const useCase = new CheckAndIncrementUsageUseCase(
    usagesRepository,
    userSubscriptionsRepository,
    plansRepository,
  )

  return useCase
}
