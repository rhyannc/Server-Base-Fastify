import { PrismaPlansRepository } from '@/repositories/prisma/prisma-plans-repository'

import { UpdatePlanUseCase } from '../plans/update-plan'

export function makeUpdatePlansUseCase() {
  const plansRepository = new PrismaPlansRepository()
  const useCase = new UpdatePlanUseCase(plansRepository)

  return useCase
}
