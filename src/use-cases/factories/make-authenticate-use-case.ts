import { PrismaActivityLogsRepository } from '@/repositories/prisma/prisma-activity-logs-repository'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-respository'

import { AuthenticateUseCase } from '../authenticate'

export function makeAuthenticateUseCase() {
  const prismaUsersRepository = new PrismaUsersRepository()
  const prismaActivityLogsRepository = new PrismaActivityLogsRepository()
  const authenticateUseCase = new AuthenticateUseCase(
    prismaUsersRepository,
    prismaActivityLogsRepository,
  )

  return authenticateUseCase
}
