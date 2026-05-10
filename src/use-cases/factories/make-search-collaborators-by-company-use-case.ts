import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'

import { SearchCollaboratorsByCompanyUseCase } from '../collaborators/search-collaborators-by-company'

export function makeSearchCollaboratorsByCompanyUseCase() {
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
  const companiesRepository = new PrismaCompaniesRepository()

  const useCase = new SearchCollaboratorsByCompanyUseCase(
    collaboratorsRepository,
    companiesRepository,
  )

  return useCase
}
