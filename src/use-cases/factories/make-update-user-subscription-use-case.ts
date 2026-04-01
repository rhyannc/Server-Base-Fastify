import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'
import { PrismaPlansRepository } from '@/repositories/prisma/prisma-plans-repository'
import { PrismaUsagesRepository } from '@/repositories/prisma/prisma-usages-repository'
import { PrismaUserSubscriptionsRepository } from '@/repositories/prisma/prisma-user-subscriptions-repository'

import { UpdateUserSubscriptionUseCase } from '../subscriptions/update-user-subscription'

export function makeUpdateUserSubscriptionUseCase() {
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()
  const plansRepository = new PrismaPlansRepository()

  const collaboratorsRepository = new PrismaCollaboratorsRepository()
  const companiesRepository = new PrismaCompaniesRepository()
  const usagesRepository = new PrismaUsagesRepository()

  const useCase = new UpdateUserSubscriptionUseCase(
    userSubscriptionsRepository,
    plansRepository,
    companiesRepository,
    collaboratorsRepository,
    usagesRepository,
  )

  return useCase
}
