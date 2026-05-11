import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'

import { FetchUserCompaniesUseCase } from '../companies/fetch-user-companies'

export function makeFetchUserCompaniesUseCase() {
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
  const companiesRepository = new PrismaCompaniesRepository()
  const useCase = new FetchUserCompaniesUseCase(collaboratorsRepository, companiesRepository)

  return useCase
}
