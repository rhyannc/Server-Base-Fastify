import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'
import { PrismaUserSubscriptionsRepository } from '@/repositories/prisma/prisma-user-subscriptions-repository'
import { PrismaSubscriptionEventsRepository } from '@/repositories/prisma/prisma-subscription-events-repository'

import { CancelUserSubscriptionUseCase } from '../subscriptions/cancel-user-subscription'

export function makeCancelUserSubscriptionUseCase() {
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()
  const companiesRepository = new PrismaCompaniesRepository()
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
  const subscriptionEventsRepository = new PrismaSubscriptionEventsRepository()

  const useCase = new CancelUserSubscriptionUseCase(
    userSubscriptionsRepository,
    companiesRepository,
    collaboratorsRepository,
    subscriptionEventsRepository,
  )

  return useCase
}
