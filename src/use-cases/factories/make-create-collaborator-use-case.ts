import { PrismaActivityLogsRepository } from '@/repositories/prisma/prisma-activity-logs-repository'
import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'
import { EtherealMailProvider } from '@/providers/mail/implementations/EtherealMailProvider'
import { ResendMailProvider } from '@/providers/mail/implementations/ResendMailProvider'
import { env } from '@/env'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-respository'

import { CreateCollaboratorUseCase } from '../collaborators/create-collaborator'
import { makeCheckAndIncrementUsageUseCase } from './make-check-and-increment-usage-use-case'

export function makeCreateCollaboratorUseCase() {
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
  const companiesRepository = new PrismaCompaniesRepository()
  const usersRepository = new PrismaUsersRepository()
  const checkAndIncrementUsageUseCase = makeCheckAndIncrementUsageUseCase()
  const activityLogsRepository = new PrismaActivityLogsRepository()
  
  const mailProvider = env.NODE_ENV === 'production' 
    ? new ResendMailProvider() 
    : new EtherealMailProvider()

  const createCollaboratorUseCase = new CreateCollaboratorUseCase(
    collaboratorsRepository,
    companiesRepository,
    usersRepository,
    checkAndIncrementUsageUseCase,
    mailProvider,
    activityLogsRepository
  )

  return createCollaboratorUseCase
}
