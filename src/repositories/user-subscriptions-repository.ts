import { Prisma, UserSubscription } from '@prisma/client'

export interface UserSubscriptionsRepository {
  create(
    data: Prisma.UserSubscriptionUncheckedCreateInput,
  ): Promise<UserSubscription>
  findByUserId(userId: string): Promise<UserSubscription | null>
  update(
    data: Prisma.UserSubscriptionUncheckedUpdateInput,
  ): Promise<UserSubscription>
}
