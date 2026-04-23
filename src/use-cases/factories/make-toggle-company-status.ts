import { PrismaActivityLogsRepository } from '@/repositories/prisma/prisma-activity-logs-repository'
import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'
import { PrismaPlansRepository } from '@/repositories/prisma/prisma-plans-repository'
import { PrismaUsagesRepository } from '@/repositories/prisma/prisma-usages-repository'
import { PrismaUserSubscriptionsRepository } from '@/repositories/prisma/prisma-user-subscriptions-repository'

import { ToggleCompanyStatusUseCase } from '../companies/toggle-company-status'

export function makeToggleCompanyStatusUseCase() {
  const companiesRepository = new PrismaCompaniesRepository()
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()
  const plansRepository = new PrismaPlansRepository()
  const usagesRepository = new PrismaUsagesRepository()
  const activityLogsRepository = new PrismaActivityLogsRepository()

  const useCase = new ToggleCompanyStatusUseCase(
    companiesRepository,
    collaboratorsRepository,
    userSubscriptionsRepository,
    plansRepository,
    usagesRepository,
    activityLogsRepository,
  )

  return useCase
}
