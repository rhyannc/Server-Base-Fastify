import { Plan, Prisma } from '@prisma/client'

export interface PlansRepository {
  searchMany(query: string, page: number): Promise<Plan[]>
  create(data: Prisma.PlanCreateInput): Promise<Plan>
}
