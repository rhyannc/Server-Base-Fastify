import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'
import { PrismaPlansRepository } from '@/repositories/prisma/prisma-plans-repository'
import { PrismaUsagesRepository } from '@/repositories/prisma/prisma-usages-repository'
import { PrismaUserSubscriptionsRepository } from '@/repositories/prisma/prisma-user-subscriptions-repository'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-respository'

import { CheckAndIncrementUsageUseCase } from '../check-and-increment-usage'
import { DecrementUsageUseCase } from '../decrement-usage'
import { TransferManagerCompanyUseCase } from '../transfer-manager-company'

export function makeTransferManagerCompanyUseCase() {
  const companiesRepository = new PrismaCompaniesRepository()
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
  const usersRepository = new PrismaUsersRepository()
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()
  const usagesRepository = new PrismaUsagesRepository()
  const plansRepository = new PrismaPlansRepository()

  const checkAndIncrementUsageUseCase = new CheckAndIncrementUsageUseCase(
    usagesRepository,
    userSubscriptionsRepository,
    plansRepository,
  )

  const decrementUsageUseCase = new DecrementUsageUseCase(usagesRepository)

  const useCase = new TransferManagerCompanyUseCase(
    companiesRepository,
    collaboratorsRepository,
    usersRepository,
    userSubscriptionsRepository,
    plansRepository,
    usagesRepository,
    checkAndIncrementUsageUseCase,
    decrementUsageUseCase,
  )

  return useCase
}
