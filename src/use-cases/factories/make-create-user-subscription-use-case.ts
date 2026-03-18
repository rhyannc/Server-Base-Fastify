import { PrismaPlansRepository } from '@/repositories/prisma/prisma-plans-repository'
import { PrismaUserSubscriptionsRepository } from '@/repositories/prisma/prisma-user-subscriptions-repository'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-respository'

import { CreateUserSubscriptionUseCase } from '../create-user-subscription'

export function makeCreateUserSubscriptionUseCase() {
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()
  const usersRepository = new PrismaUsersRepository()
  const plansRepository = new PrismaPlansRepository()

  const useCase = new CreateUserSubscriptionUseCase(
    userSubscriptionsRepository,
    usersRepository,
    plansRepository,
  )

  return useCase
}
