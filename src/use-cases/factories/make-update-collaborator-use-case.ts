import { PrismaActivityLogsRepository } from '@/repositories/prisma/prisma-activity-logs-repository'
import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'
import { PrismaPlansRepository } from '@/repositories/prisma/prisma-plans-repository'
import { PrismaUsagesRepository } from '@/repositories/prisma/prisma-usages-repository'
import { PrismaUserSubscriptionsRepository } from '@/repositories/prisma/prisma-user-subscriptions-repository'

import { UpdateCollaboratorUseCase } from '../collaborators/update-collaborator'

export function makeUpdateCollaboratorUseCase() {
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
  const companiesRepository = new PrismaCompaniesRepository()
  const userSubscriptionsRepository = new PrismaUserSubscriptionsRepository()
  const plansRepository = new PrismaPlansRepository()
  const usagesRepository = new PrismaUsagesRepository()
  const prismaActivityLogsRepository = new PrismaActivityLogsRepository()

  const useCase = new UpdateCollaboratorUseCase(
    collaboratorsRepository,
    companiesRepository,
    userSubscriptionsRepository,
    plansRepository,
    usagesRepository,
    prismaActivityLogsRepository,
  )

  return useCase
}
