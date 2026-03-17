import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'

import { UpdateCollaboratorUseCase } from '../update-collaborator'

export function makeUpdateCollaboratorUseCase() {
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
  const companiesRepository = new PrismaCompaniesRepository()
  const useCase = new UpdateCollaboratorUseCase(
    collaboratorsRepository,
    companiesRepository,
  )

  return useCase
}
