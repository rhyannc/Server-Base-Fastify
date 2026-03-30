import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryCollaboratorsRepository } from '@/repositories/im-memory/in-memory-collaborators-repository'
import { InMemoryCompaniesRepository } from '@/repositories/im-memory/in-memory-companies-repository'
import { InMemoryUsersRepository } from '@/repositories/im-memory/in-memory-users-repository'
import { InMemoryUserSubscriptionsRepository } from '@/repositories/im-memory/in-memory-user-subscriptions-repository'
import { InMemoryUsagesRepository } from '@/repositories/im-memory/in-memory-usages-repository'
import { InMemoryPlansRepository } from '@/repositories/im-memory/in-memory-plans-repository'
import { CheckAndIncrementUsageUseCase } from '../check-and-increment-usage'
import { DecrementUsageUseCase } from '../decrement-usage'
import { TransferManagerCompanyUseCase } from '../transfer-manager-company'
import { PlanLimitChangeManagerRachedError } from '../errors/plan-limit-change-manager-rached-error'
import { UsageMetric } from '@prisma/client'

let companiesRepository: InMemoryCompaniesRepository
let collaboratorsRepository: InMemoryCollaboratorsRepository
let usersRepository: InMemoryUsersRepository
let userSubscriptionsRepository: InMemoryUserSubscriptionsRepository
let usagesRepository: InMemoryUsagesRepository
let plansRepository: InMemoryPlansRepository
let checkAndIncrementUsageUseCase: CheckAndIncrementUsageUseCase
let decrementUsageUseCase: DecrementUsageUseCase
let sut: TransferManagerCompanyUseCase
let planId: string

describe('Transfer Manager Company Use Case', () => {
    beforeEach(async () => {
        companiesRepository = new InMemoryCompaniesRepository()
        collaboratorsRepository = new InMemoryCollaboratorsRepository(companiesRepository)
        usersRepository = new InMemoryUsersRepository()
        userSubscriptionsRepository = new InMemoryUserSubscriptionsRepository()
        usagesRepository = new InMemoryUsagesRepository()
        plansRepository = new InMemoryPlansRepository()

        checkAndIncrementUsageUseCase = new CheckAndIncrementUsageUseCase(
            usagesRepository,
            userSubscriptionsRepository,
            plansRepository
        )

        decrementUsageUseCase = new DecrementUsageUseCase(usagesRepository)

        sut = new TransferManagerCompanyUseCase(
            companiesRepository,
            collaboratorsRepository,
            usersRepository,
            userSubscriptionsRepository,
            plansRepository,
            usagesRepository,
            checkAndIncrementUsageUseCase,
            decrementUsageUseCase
        )

        // Criar plano e assinaturas para os testes
        const plan = await plansRepository.create({
            name: 'Basic',
            price: 100,
            maxCompanies: 2,
            maxCollaborators: 5,
        })
        planId = plan.id
    })

    it('should be able to transfer a company and its collaborators usage', async () => {
        const admin = await usersRepository.create({ name: 'Admin', email: 'admin@example.com', passwordHash: '123' })
        const oldManager = await usersRepository.create({ name: 'Old Manager', email: 'old@example.com', passwordHash: '123' })
        const newManager = await usersRepository.create({ name: 'New Manager', email: 'new@example.com', passwordHash: '123' })

        await userSubscriptionsRepository.create({ userId: oldManager.id, planId, status: 'ACTIVE' })
        await userSubscriptionsRepository.create({ userId: newManager.id, planId, status: 'ACTIVE' })

        const company = await companiesRepository.create({ name: 'Company 1', managerId: oldManager.id })
        
        await collaboratorsRepository.create({ userId: admin.id, companyId: company.id, status: 'ACTIVE' })
        await collaboratorsRepository.create({ userId: oldManager.id, companyId: company.id, status: 'FROZEN' })

        // Setup usage inicial
        const now = new Date()
        const period = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
        
        await usagesRepository.create({ userId: oldManager.id, metric: UsageMetric.COMPANIES, value: 1, period })
        await usagesRepository.create({ userId: oldManager.id, metric: UsageMetric.COLLABORATORS, value: 2, period })

        const { company: updatedCompanyResponse } = await sut.execute({
            companyId: company.id,
            newManagerId: newManager.id
        })

        // Verifica transferência
        expect(updatedCompanyResponse.managerId).toEqual(newManager.id)
        const updatedCompany = await companiesRepository.findById(company.id)
        expect(updatedCompany?.managerId).toEqual(newManager.id)

        // Verifica incrementos no novo manager
        const newManagerCompanyUsage = await usagesRepository.findByUserIdAndMetric(newManager.id, UsageMetric.COMPANIES, period)
        const newManagerCollaboratorUsage = await usagesRepository.findByUserIdAndMetric(newManager.id, UsageMetric.COLLABORATORS, period)
        
        expect(newManagerCompanyUsage?.value).toEqual(1)
        expect(newManagerCollaboratorUsage?.value).toEqual(2)

        // Verifica decrementos no manager antigo
        const oldManagerCompanyUsage = await usagesRepository.findByUserIdAndMetric(oldManager.id, UsageMetric.COMPANIES, period)
        const oldManagerCollaboratorUsage = await usagesRepository.findByUserIdAndMetric(oldManager.id, UsageMetric.COLLABORATORS, period)

        expect(oldManagerCompanyUsage?.value).toEqual(0)
        expect(oldManagerCollaboratorUsage?.value).toEqual(0)
    })

    it('should not be able to transfer if new manager reached company limit', async () => {
        const oldManager = await usersRepository.create({ name: 'Old Manager', email: 'old@example.com', passwordHash: '123' })
        const newManager = await usersRepository.create({ name: 'New Manager', email: 'new@example.com', passwordHash: '123' })

        await userSubscriptionsRepository.create({ userId: oldManager.id, planId, status: 'ACTIVE' })
        await userSubscriptionsRepository.create({ userId: newManager.id, planId, status: 'ACTIVE' })

        // New manager já tem 2 empresas (limite do plan-1)
        const now = new Date()
        const period = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
        await usagesRepository.create({ userId: newManager.id, metric: UsageMetric.COMPANIES, value: 2, period })

        const company = await companiesRepository.create({ name: 'Company to Transfer', managerId: oldManager.id })

        await expect(() => sut.execute({
            companyId: company.id,
            newManagerId: newManager.id
        })).rejects.toBeInstanceOf(PlanLimitChangeManagerRachedError)
    })
})
