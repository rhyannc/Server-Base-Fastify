import { PrismaPlansRepository } from '@/repositories/prisma/prisma-plans-repository'

import { FetchPlansUseCase } from '../fetch-plans'

export function makeFindPlansUseCase() {
  const plansRepository = new PrismaPlansRepository()
  const useCase = new FetchPlansUseCase(plansRepository)

  return useCase
}
