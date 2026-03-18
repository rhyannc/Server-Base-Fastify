import { Prisma, Usage, UsageMetric } from '@prisma/client'

export interface UsagesRepository {
  findByUserIdAndMetric(
    userId: string,
    metric: UsageMetric,
    period: Date,
  ): Promise<Usage | null>
  create(data: Prisma.UsageUncheckedCreateInput): Promise<Usage>
  increment(id: string, amount?: number): Promise<Usage>
  decrement(id: string, amount?: number): Promise<Usage>
  setValue(id: string, value: number): Promise<Usage>
  findManyByUserId(userId: string, period: Date): Promise<Usage[]>
}
