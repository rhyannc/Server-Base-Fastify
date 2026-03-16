import { PrismaPlansRepository } from '@/repositories/prisma/prisma-plans-repository'

import { SearchPlansUseCase } from '../search-plans'

export function makeSearchPlansUseCase() {
  const plansRepository = new PrismaPlansRepository()
  const useCase = new SearchPlansUseCase(plansRepository)

  return useCase
}
