import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'

import { FetchCompanyCollaboratorsUseCase } from '../fetch-company-collaborators'

export function makeFetchCompanyCollaboratorsUseCase() {
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
  const useCase = new FetchCompanyCollaboratorsUseCase(collaboratorsRepository)

  return useCase
}
