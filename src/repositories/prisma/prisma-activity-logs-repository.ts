import { prisma } from '@/lib/prisma'
import { ActivityLog, Prisma } from '@prisma/client'
import { ActivityLogsRepository } from '../activity-logs-repository'

export class PrismaActivityLogsRepository implements ActivityLogsRepository {
  async create(data: Prisma.ActivityLogUncheckedCreateInput): Promise<ActivityLog> {
    const activityLog = await prisma.activityLog.create({
      data,
    })

    return activityLog
  }

  async findManyByUserId(userId: string): Promise<ActivityLog[]> {
    const activityLogs = await prisma.activityLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return activityLogs
  }
}
