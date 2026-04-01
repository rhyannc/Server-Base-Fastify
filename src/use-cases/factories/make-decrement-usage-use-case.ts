import { PrismaUsagesRepository } from '@/repositories/prisma/prisma-usages-repository'

import { DecrementUsageUseCase } from '../usages/decrement-usage'

export function makeDecrementUsageUseCase() {
  const usagesRepository = new PrismaUsagesRepository()
  const useCase = new DecrementUsageUseCase(usagesRepository)

  return useCase
}
