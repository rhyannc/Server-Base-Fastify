import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryUserSubscriptionsRepository } from '@/repositories/im-memory/in-memory-user-subscriptions-repository'
import { InMemoryPlansRepository } from '@/repositories/im-memory/in-memory-plans-repository'
import { GetMeSubscriptionUseCase } from '../subscriptions/get-me-subscription'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

let userSubscriptionsRepository: InMemoryUserSubscriptionsRepository
let plansRepository: InMemoryPlansRepository
let sut: GetMeSubscriptionUseCase

describe('Get Me Subscription Use Case', () => {
    beforeEach(() => {
        userSubscriptionsRepository = new InMemoryUserSubscriptionsRepository()
        plansRepository = new InMemoryPlansRepository()
        sut = new GetMeSubscriptionUseCase(userSubscriptionsRepository, plansRepository)
    })

    it('should be able to get user subscription with plan details', async () => {
        const plan = await plansRepository.create({
            name: 'Premium',
            price: 299,
            maxCompanies: 10,
            maxCollaborators: 50,
        })

        await userSubscriptionsRepository.create({
            userId: 'user-1',
            planId: plan.id,
            status: 'ACTIVE',
        })

        const { subscription } = await sut.execute({
            userId: 'user-1',
        })

        expect(subscription.userId).toEqual('user-1')
        expect(subscription.plan.name).toEqual('Premium')
        expect(subscription.plan.maxCompanies).toEqual(10)
    })

    it('should not be able to get subscription if it does not exist', async () => {
        await expect(() => sut.execute({
            userId: 'non-existing-user',
        })).rejects.toBeInstanceOf(ResourceNotFoundError)
    })
})
