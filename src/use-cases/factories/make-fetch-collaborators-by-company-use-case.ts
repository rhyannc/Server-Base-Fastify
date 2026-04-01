import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'

import { FetchCollaboratorsByCompanyUseCase } from '../collaborators/fetch-collaborators-companyId'
import { PrismaCompaniesRepository } from '@/repositories/prisma/prisma-companies-respository'

export function makeFetchCollaboratorsByCompanyUseCase() {
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
   const companiesRepository = new PrismaCompaniesRepository()
  const useCase = new FetchCollaboratorsByCompanyUseCase(collaboratorsRepository, companiesRepository)
  

  return useCase
}
