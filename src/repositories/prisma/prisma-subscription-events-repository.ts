import { Prisma, SubscriptionEvent } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { SubscriptionEventsRepository } from '../subscription-events-repository'

export class PrismaSubscriptionEventsRepository implements SubscriptionEventsRepository {
  async create(data: Prisma.SubscriptionEventUncheckedCreateInput): Promise<SubscriptionEvent> {
    const event = await prisma.subscriptionEvent.create({
      data,
    })

    return event
  }
}
