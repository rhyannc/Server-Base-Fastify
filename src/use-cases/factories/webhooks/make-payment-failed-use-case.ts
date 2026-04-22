import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'
import { PrismaUsagesRepository } from '@/repositories/prisma/prisma-usages-repository'
import { PrismaUserSubscriptionsRepository } from '@/repositories/prisma/prisma-user-subscriptions-repository'

import { PaymentFailedUseCase } from '../../gateways/stripe/payment-failed'

export function makePaymentFailedUseCase() {
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()
  const companiesRepository = new PrismaCompaniesRepository()
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
  const usagesRepository = new PrismaUsagesRepository()

  const useCase = new PaymentFailedUseCase(
    userSubscriptionsRepository,
    companiesRepository,
    collaboratorsRepository,
    usagesRepository,
  )

  return useCase
}
