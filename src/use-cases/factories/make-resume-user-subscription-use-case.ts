import { PrismaUserSubscriptionsRepository } from '@/repositories/prisma/prisma-user-subscriptions-repository'
import { PrismaSubscriptionEventsRepository } from '@/repositories/prisma/prisma-subscription-events-repository'
import { ResumeUserSubscriptionUseCase } from '../subscriptions/resume-user-subscription'

export function makeResumeUserSubscriptionUseCase() {
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()
  const subscriptionEventsRepository = new PrismaSubscriptionEventsRepository()

  const useCase = new ResumeUserSubscriptionUseCase(
    userSubscriptionsRepository,
    subscriptionEventsRepository,
  )

  return useCase
}
