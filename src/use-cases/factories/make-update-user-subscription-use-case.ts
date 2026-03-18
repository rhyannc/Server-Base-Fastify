import { PrismaPlansRepository } from '@/repositories/prisma/prisma-plans-repository'
import { PrismaUserSubscriptionsRepository } from '@/repositories/prisma/prisma-user-subscriptions-repository'

import { UpdateUserSubscriptionUseCase } from '../update-user-subscription'

export function makeUpdateUserSubscriptionUseCase() {
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()
  const plansRepository = new PrismaPlansRepository()

  const useCase = new UpdateUserSubscriptionUseCase(
    userSubscriptionsRepository,
    plansRepository,
  )

  return useCase
}
