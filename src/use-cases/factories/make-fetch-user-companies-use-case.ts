import { PrismaCollaboratorsRepository } from '@/repositories/prisma/prisma-collaborators-repository'

import { FetchUserCompaniesUseCase } from '../companies/fetch-user-companies'

export function makeFetchUserCompaniesUseCase() {
  const collaboratorsRepository = new PrismaCollaboratorsRepository()
  const useCase = new FetchUserCompaniesUseCase(collaboratorsRepository)

  return useCase
}
