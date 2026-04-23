import { ActivityLog, Prisma } from '@prisma/client'

export interface ActivityLogsRepository {
  create(data: Prisma.ActivityLogUncheckedCreateInput): Promise<ActivityLog>
  findManyByUserId(userId: string): Promise<ActivityLog[]>
}
