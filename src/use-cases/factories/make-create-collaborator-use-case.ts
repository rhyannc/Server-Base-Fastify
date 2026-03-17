import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-respository'

import { CreateCollaboratorUseCase } from '../create-collaborator'

export function makeCreateCollaboratorUseCase() {
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
  const companiesRepository = new PrismaCompaniesRepository()
  const usersRepository = new PrismaUsersRepository()
  const useCase = new CreateCollaboratorUseCase(
    collaboratorsRepository,
    companiesRepository,
    usersRepository,
  )

  return useCase
}
