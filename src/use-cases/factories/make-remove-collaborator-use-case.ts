import { PrismaActivityLogsRepository } from '@/repositories/prisma/prisma-activity-logs-repository'
import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'

import { RemoveCollaboratorUseCase } from '../collaborators/remove-collaborator'
import { makeDecrementUsageUseCase } from './make-decrement-usage-use-case'

export function makeRemoveCollaboratorUseCase() {
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
  const companiesRepository = new PrismaCompaniesRepository()
  const decrementUsageUseCase = makeDecrementUsageUseCase()
  const activityLogsRepository = new PrismaActivityLogsRepository()

  const removeCollaboratorUseCase = new RemoveCollaboratorUseCase(
    collaboratorsRepository,
    companiesRepository,
    decrementUsageUseCase,
    activityLogsRepository,
  )

  return removeCollaboratorUseCase
}
