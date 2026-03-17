import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'

import { RemoveCollaboratorUseCase } from '../remove-collaborator'

export function makeRemoveCollaboratorUseCase() {
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
  const companiesRepository = new PrismaCompaniesRepository()
  const useCase = new RemoveCollaboratorUseCase(
    collaboratorsRepository,
    companiesRepository,
  )

  return useCase
}
