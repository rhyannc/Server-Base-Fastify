import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'
import { PrismaUserSubscriptionsRepository } from '@/repositories/prisma/prisma-user-subscriptions-repository'

import { PaymentReceivedUseCase } from '../../webhooks/payment-received'

export function makePaymentReceivedUseCase() {
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()
  const companiesRepository = new PrismaCompaniesRepository()
  const collaboratorsRepository = new PrismaCollaboratorsRepository()

  const useCase = new PaymentReceivedUseCase(
    userSubscriptionsRepository,
    companiesRepository,
    collaboratorsRepository,
  )

  return useCase
}
