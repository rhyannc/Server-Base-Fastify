import { randomUUID } from 'node:crypto'

import { Prisma, UserSubscription } from '@prisma/client'

import { UserSubscriptionsRepository } from '../user-subscriptions-repository'

export class InMemoryUserSubscriptionsRepository
  implements UserSubscriptionsRepository
{
  public items: UserSubscription[] = []

  async create(data: Prisma.UserSubscriptionUncheckedCreateInput) {
    const userSubscription = {
      id: randomUUID(),
      userId: data.userId,
      planId: data.planId,
      status: data.status,
      startedAt: data.startedAt ? new Date(data.startedAt) : new Date(),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : null,
      canceledAt: data.canceledAt ? new Date(data.canceledAt) : null,
      gracePeriodEndsAt: data.gracePeriodEndsAt
        ? new Date(data.gracePeriodEndsAt)
        : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      stripeSubscriptionId: data.stripeSubscriptionId ?? null,
      stripePriceId: data.stripePriceId ?? null,
    }

    this.items.push(userSubscription)

    return userSubscription
  }

  async findByUserId(userId: string) {
    const userSubscription = this.items.find((item) => item.userId === userId)

    if (!userSubscription) {
      return null
    }

    return userSubscription
  }

  async update(data: Prisma.UserSubscriptionUncheckedUpdateInput) {
    const index = this.items.findIndex((item) => item.id === data.id)

    if (index >= 0) {
      this.items[index] = { ...this.items[index], ...data } as any
    }

    return this.items[index]
  }
}
