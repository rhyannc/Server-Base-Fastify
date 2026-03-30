import { PrismaUserSubscriptionsRepository } from '@/repositories/prisma/prisma-user-subscriptions-repository'
import { PrismaPlansRepository } from '@/repositories/prisma/prisma-plans-repository'
import { GetMeSubscriptionUseCase } from '../get-me-subscription'

export function makeGetMeSubscriptionUseCase() {
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()
  const plansRepository = new PrismaPlansRepository()
  const useCase = new GetMeSubscriptionUseCase(userSubscriptionsRepository, plansRepository)

  return useCase
}
