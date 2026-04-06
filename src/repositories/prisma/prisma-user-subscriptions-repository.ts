import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { UserSubscriptionsRepository } from '../user-subscriptions-repository'

export class PrismaUserSubscriptionsRepository
  implements UserSubscriptionsRepository
{
  async create(data: Prisma.UserSubscriptionUncheckedCreateInput) {
    const userSubscription = await prisma.userSubscription.create({
      data,
    })

    return userSubscription
  }

  async findByUserId(userId: string) {
    const userSubscription = await prisma.userSubscription.findUnique({
      where: {
        userId,
      },
    })

    return userSubscription
  }

  async update(data: Prisma.UserSubscriptionUncheckedUpdateInput) {
    const userSubscription = await prisma.userSubscription.update({
      where: {
        id: String(data.id),
      },
      data,
    })

    return userSubscription
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string) {
    const userSubscription = await prisma.userSubscription.findUnique({
      where: {
        stripeSubscriptionId,
      },
    })

    return userSubscription
  }
}
