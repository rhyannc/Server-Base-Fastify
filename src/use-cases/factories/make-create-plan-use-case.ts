import { PrismaPlansRepository } from '@/repositories/prisma/prisma-plans-repository'

import { CreatePlanUseCase } from '../plans/create-plan'

export function makeCreatePlanUseCase() {
  const prismaPlansRepository = new PrismaPlansRepository()
  const createPlanUseCase = new CreatePlanUseCase(prismaPlansRepository)

  return createPlanUseCase
}
