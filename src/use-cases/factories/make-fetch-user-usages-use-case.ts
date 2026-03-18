import { PrismaUsagesRepository } from '@/repositories/prisma/prisma-usages-repository'
import { FetchUserUsagesUseCase } from '../fetch-user-usages'

export function makeFetchUserUsagesUseCase() {
  const usagesRepository = new PrismaUsagesRepository()
  const useCase = new FetchUserUsagesUseCase(usagesRepository)
  return useCase
}
