import { PrismaUsagesRepository } from '@/repositories/prisma/prisma-usages-repository'
import { UpdateUsageUseCase } from '../usages/update-usage'

export function makeUpdateUsageUseCase() {
  const usagesRepository = new PrismaUsagesRepository()
  const useCase = new UpdateUsageUseCase(usagesRepository)
  return useCase
}
