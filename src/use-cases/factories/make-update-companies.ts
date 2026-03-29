import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'

import { UpdateCompanyUseCase } from '../update-company'

export function makeUpdateCompaniesUseCase() {
  const companiesRepository = new PrismaCompaniesRepository()
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
  const useCase = new UpdateCompanyUseCase(
    companiesRepository,
    collaboratorsRepository,
  )

  return useCase
}
