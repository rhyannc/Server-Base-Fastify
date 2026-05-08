import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'
import { PrismaPlansRepository } from '@/repositories/prisma/prisma-plans-repository'
import { PrismaUserSubscriptionsRepository } from '@/repositories/prisma/prisma-user-subscriptions-repository'
import { PrismaUsagesRepository } from '@/repositories/prisma/prisma-usages-repository'
import { PrismaActivityLogsRepository } from '@/repositories/prisma/prisma-activity-logs-repository'
import { ReactivateAssetsUseCase } from '../subscriptions/reactivate-assets'

export function makeReactivateAssetsUseCase() {
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()
  const plansRepository = new PrismaPlansRepository()
  const companiesRepository = new PrismaCompaniesRepository()
  const usagesRepository = new PrismaUsagesRepository()
  const activityLogsRepository = new PrismaActivityLogsRepository()

  const useCase = new ReactivateAssetsUseCase(
    userSubscriptionsRepository,
    plansRepository,
    companiesRepository,
    usagesRepository,
    activityLogsRepository,
  )

  return useCase
}
