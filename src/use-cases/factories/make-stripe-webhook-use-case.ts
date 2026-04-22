import { PrismaCollaboratorsRepository } from '../../repositories/prisma/prisma-collaborators-repository'
import { PrismaCompaniesRepository } from '../../repositories/prisma/prisma-companies-respository'
import { PrismaInvoicesRepository } from '../../repositories/prisma/prisma-invoices-repository'
import { PrismaUsagesRepository } from '../../repositories/prisma/prisma-usages-repository'
import { PrismaUserSubscriptionsRepository } from '../../repositories/prisma/prisma-user-subscriptions-repository'
import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-respository'
import { PrismaSubscriptionEventsRepository } from '../../repositories/prisma/prisma-subscription-events-repository'
import { StripeWebhookUseCase } from '../gateways/stripe/stripe-webhook'

export function makeStripeWebhookUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()
  const companiesRepository = new PrismaCompaniesRepository()
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
  const invoicesRepository = new PrismaInvoicesRepository()
  const subscriptionEventsRepository = new PrismaSubscriptionEventsRepository()
  const usagesRepository = new PrismaUsagesRepository()
  
  const useCase = new StripeWebhookUseCase(
    usersRepository, 
    userSubscriptionsRepository,
    companiesRepository,
    collaboratorsRepository,
    invoicesRepository,
    subscriptionEventsRepository,
    usagesRepository,
  )

  return useCase
}
