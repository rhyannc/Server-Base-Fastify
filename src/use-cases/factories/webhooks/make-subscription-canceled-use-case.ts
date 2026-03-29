import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'
import { PrismaUserSubscriptionsRepository } from '@/repositories/prisma/prisma-user-subscriptions-repository'

import { SubscriptionCanceledUseCase } from '../../webhooks/subscription-canceled'

export function makeSubscriptionCanceledUseCase() {
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()
  const companiesRepository = new PrismaCompaniesRepository()
  const collaboratorsRepository = new PrismaCollaboratorsRepository()

  const useCase = new SubscriptionCanceledUseCase(
    userSubscriptionsRepository,
    companiesRepository,
    collaboratorsRepository,
  )

  return useCase
}
