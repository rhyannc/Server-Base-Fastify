import { ActivityLogsRepository } from '@/repositories/activity-logs-repository'
import { ActivityLog } from '@prisma/client'

interface RegisterActivityLogUseCaseRequest {
  userId?: string
  action: string
  resource: string
  resourceId?: string
  description?: string
  oldState?: any
  newState?: any
  ip?: string
  userAgent?: string
}

interface RegisterActivityLogUseCaseResponse {
  activityLog: ActivityLog
}

export class RegisterActivityLogUseCase {
  constructor(private activityLogsRepository: ActivityLogsRepository) {}

  async execute({
    userId,
    action,
    resource,
    resourceId,
    description,
    oldState,
    newState,
    ip,
    userAgent,
  }: RegisterActivityLogUseCaseRequest): Promise<RegisterActivityLogUseCaseResponse> {
    try {
      const activityLog = await this.activityLogsRepository.create({
        userId,
        action,
        resource,
        resourceId,
        description,
        oldState: oldState ? JSON.parse(JSON.stringify(oldState)) : undefined,
        newState: newState ? JSON.parse(JSON.stringify(newState)) : undefined,
        ip,
        userAgent,
      })

      return {
        activityLog,
      }
    } catch (error) {
       // Log the error but don't throw to prevent crashing the main flow
       console.error(`[ActivityLog] Failed to register activity log:`, error)
       
       // Return a dummy object to satisfy the response type
       return {
         activityLog: {} as ActivityLog
       }
    }
  }
}
