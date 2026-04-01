import { PrismaUserSubscriptionsRepository } from '../../repositories/prisma/prisma-user-subscriptions-repository'
import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-respository'
import { StripeWebhookUseCase } from '../gateways/stripe/stripe-webhook'

export function makeStripeWebhookUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()
  const useCase = new StripeWebhookUseCase(usersRepository, userSubscriptionsRepository)

  return useCase
}
