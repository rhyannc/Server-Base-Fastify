import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'

import { FetchCompanyCollaboratorsUseCase } from '../fetch-company-collaborators'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'

export function makeFetchCompanyCollaboratorsUseCase() {
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
   const companiesRepository = new PrismaCompaniesRepository()
  const useCase = new FetchCompanyCollaboratorsUseCase(collaboratorsRepository, companiesRepository)
  

  return useCase
}
