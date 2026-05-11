import { Plan, Prisma } from '@prisma/client'

export interface PlansRepository {
  findById(id: string): Promise<Plan | null>
  findByStripePriceId(stripePriceId: string): Promise<Plan | null>
  findMany(page: number, onlyActive?: boolean): Promise<[Plan[], number]>
  searchMany(query: string, page: number): Promise<[Plan[], number]>
  create(data: Prisma.PlanCreateInput): Promise<Plan>
  update(data: Prisma.PlanUncheckedUpdateInput): Promise<Plan>
}
