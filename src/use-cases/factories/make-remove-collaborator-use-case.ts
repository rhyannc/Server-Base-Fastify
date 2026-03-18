import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'

import { RemoveCollaboratorUseCase } from '../remove-collaborator'
import { makeDecrementUsageUseCase } from './make-decrement-usage-use-case'

export function makeRemoveCollaboratorUseCase() {
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
  const companiesRepository = new PrismaCompaniesRepository()
  const decrementUsageUseCase = makeDecrementUsageUseCase()

  const removeCollaboratorUseCase = new RemoveCollaboratorUseCase(
    collaboratorsRepository,
    companiesRepository,
    decrementUsageUseCase,
  )

  return removeCollaboratorUseCase
}
