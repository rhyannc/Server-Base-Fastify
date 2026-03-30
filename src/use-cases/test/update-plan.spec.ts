import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryPlansRepository } from '@/repositories/im-memory/in-memory-plans-repository'
import { UpdatePlanUseCase } from '../update-plan'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

let plansRepository: InMemoryPlansRepository
let sut: UpdatePlanUseCase

describe('Update Plan Use Case', () => {
    beforeEach(() => {
        plansRepository = new InMemoryPlansRepository()
        sut = new UpdatePlanUseCase(plansRepository)
    })

    it('should be able to update a plan partially', async () => {
        const plan = await plansRepository.create({
            name: 'Basic',
            description: 'Basic plan',
            price: 100,
        })

        const { plan: updatedPlan } = await sut.execute({
            id: plan.id,
            price: 150,
        })

        expect(Number(updatedPlan.price)).toBe(150)
        expect(updatedPlan.name).toBe('Basic') // Mantém o nome antigo
    })

    it('should not be able to update a non-existing plan', async () => {
        await expect(() => sut.execute({
            id: 'non-existing-id',
            name: 'New Name'
        })).rejects.toBeInstanceOf(ResourceNotFoundError)
    })
})
