import { PrismaActivityLogsRepository } from '@/repositories/prisma/prisma-activity-logs-repository'
import { RegisterActivityLogUseCase } from '../activity-logs/register-activity-log'

export function makeRegisterActivityLogUseCase() {
  const activityLogsRepository = new PrismaActivityLogsRepository()
  const useCase = new RegisterActivityLogUseCase(activityLogsRepository)

  return useCase
}
