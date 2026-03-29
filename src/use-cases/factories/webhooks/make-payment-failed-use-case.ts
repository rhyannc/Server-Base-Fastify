import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'
import { PrismaUserSubscriptionsRepository } from '@/repositories/prisma/prisma-user-subscriptions-repository'

import { PaymentFailedUseCase } from '../../webhooks/payment-failed'

export function makePaymentFailedUseCase() {
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()
  const companiesRepository = new PrismaCompaniesRepository()
  const collaboratorsRepository = new PrismaCollaboratorsRepository()

  const useCase = new PaymentFailedUseCase(
    userSubscriptionsRepository,
    companiesRepository,
    collaboratorsRepository,
  )

  return useCase
}
