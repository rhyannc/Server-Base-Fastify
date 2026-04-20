import { Prisma, SubscriptionEvent } from '@prisma/client'

export interface SubscriptionEventsRepository {
  create(data: Prisma.SubscriptionEventUncheckedCreateInput): Promise<SubscriptionEvent>
}
