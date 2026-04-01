import { PrismaPlansRepository } from "@/repositories/prisma/prisma-plans-repository"

import { GetPlanIdUseCase } from "../plans/get-plan-id"


export function makeGetPlanIdUseCase() {
  const plansRepository = new PrismaPlansRepository()
  const useCase = new GetPlanIdUseCase(plansRepository)

  return useCase
}
