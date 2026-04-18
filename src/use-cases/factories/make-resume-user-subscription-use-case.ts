import { PrismaUserSubscriptionsRepository } from '@/repositories/prisma/prisma-user-subscriptions-repository'
import { ResumeUserSubscriptionUseCase } from '../subscriptions/resume-user-subscription'

export function makeResumeUserSubscriptionUseCase() {
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()

  const useCase = new ResumeUserSubscriptionUseCase(userSubscriptionsRepository)

  return useCase
}
