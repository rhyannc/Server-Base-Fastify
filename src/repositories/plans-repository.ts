import { Plan, Prisma } from '@prisma/client'

export interface PlansRepository {
  findById(id: string): Promise<Plan | null>
  findMany(page: number, onlyActive?: boolean): Promise<Plan[]>
  searchMany(query: string, page: number): Promise<Plan[]>
  create(data: Prisma.PlanCreateInput): Promise<Plan>
  update(data: Prisma.PlanUncheckedUpdateInput): Promise<Plan>
}
