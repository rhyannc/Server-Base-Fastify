import { ActivityLog, Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'

import { ActivityLogsRepository } from '../activity-logs-repository'

export class InMemoryActivityLogsRepository implements ActivityLogsRepository {
  public items: ActivityLog[] = []

  async create(data: Prisma.ActivityLogUncheckedCreateInput): Promise<ActivityLog> {
    const activityLog: ActivityLog = {
      id: data.id ?? randomUUID(),
      userId: data.userId ?? null,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId ?? null,
      minidescription: data.minidescription ?? null,
      description: data.description ?? null,
      oldState: data.oldState ? (data.oldState as any) : null,
      newState: data.newState ? (data.newState as any) : null,
      ip: data.ip ?? null,
      userAgent: data.userAgent ?? null,
      createdAt: new Date(),
    }

    this.items.push(activityLog)

    return activityLog
  }

  async findManyByUserId(userId: string): Promise<ActivityLog[]> {
    return this.items
      .filter((item) => item.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }
}
