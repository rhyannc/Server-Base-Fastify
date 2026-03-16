import { Plan, Prisma } from '@prisma/client'

export interface PlansRepository {
  findById(id: number): Promise<Plan | null>
  searchMany(query: string, page: number): Promise<Plan[]>
  create(data: Prisma.PlanCreateInput): Promise<Plan>
}
