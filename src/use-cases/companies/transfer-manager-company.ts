import { Company, UsageMetric } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'
import { UsersRepository } from '@/repositories/users-repository'
import { UserSubscriptionsRepository } from '@/repositories/user-subscriptions-repository'

import { CheckAndIncrementUsageUseCase } from '../usages/check-and-increment-usage'
import { DecrementUsageUseCase } from '../usages/decrement-usage'
import { PlanLimitReachedError } from '../errors/plan-limit-reached-error'
import { PlanNotActiveError } from '../errors/plan-not-active-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { UserNotPlanError } from '../errors/user-not-plan-error'

import { PlansRepository } from '@/repositories/plans-repository'
import { UsagesRepository } from '@/repositories/usages-repository'
import { PlanLimitChangeManagerRachedError } from '../errors/plan-limit-change-manager-rached-error'

interface TransferManagerCompanyUseCaseRequest {
  companyId: string
  newManagerId: string
}

export class TransferManagerCompanyUseCase {
  constructor(
    private companiesRepository: CompaniesRepository,
    private collaboratorsRepository: CollaboratorsRepository,
    private usersRepository: UsersRepository,
    private userSubscriptionsRepository: UserSubscriptionsRepository,
    private plansRepository: PlansRepository,
    private usagesRepository: UsagesRepository,
    private checkAndIncrementUsageUseCase: CheckAndIncrementUsageUseCase,
    private decrementUsageUseCase: DecrementUsageUseCase,
  ) {}

  async execute({
    companyId,
    newManagerId,
  }: TransferManagerCompanyUseCaseRequest): Promise<{ company: Company }> {
    // 1. Verifica se a empresa existe
    const existentCompany = await this.companiesRepository.findById(companyId)
    if (!existentCompany) {
      throw new ResourceNotFoundError()
    }

    const oldManagerId = existentCompany.managerId

    // 2. Verifica se o novo manager existe
    const newManager = await this.usersRepository.findById(newManagerId)
    if (!newManager) {
      throw new ResourceNotFoundError()
    }

    // 3. Verifica se o novo manager tem assinatura ativa
    const newSubscription =
      await this.userSubscriptionsRepository.findByUserId(newManagerId)

    if (!newSubscription || newSubscription.status !== 'ACTIVE') {
      throw new UserNotPlanError()
    }

    const plan = await this.plansRepository.findById(newSubscription.planId)
    if (!plan) {
      throw new ResourceNotFoundError()
    }

    // 4. Validação de Capacidade PRÉVIA (Sem alterar o banco ainda)
    const now = new Date()
    const period = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

    // Validar limite de empresas
    const currentCompaniesUsage = await this.usagesRepository.findByUserIdAndMetric(newManagerId, UsageMetric.COMPANIES, period)
    const currentCompaniesValue = currentCompaniesUsage ? currentCompaniesUsage.value : 0
    if (plan.maxCompanies !== null && currentCompaniesValue + 1 > plan.maxCompanies) {
        throw new PlanLimitChangeManagerRachedError(UsageMetric.COMPANIES)
    }

    // Validar limite de colaboradores
    const collaborators = await this.collaboratorsRepository.findByCompanyId(companyId)
    const activeOrFrozenCollaborators = collaborators.filter(
      (c) => c.status === 'ACTIVE' || c.status === 'FROZEN',
    )
    const collaboratorsCount = activeOrFrozenCollaborators.length

    const currentCollaboratorsUsage = await this.usagesRepository.findByUserIdAndMetric(newManagerId, UsageMetric.COLLABORATORS, period)
    const currentCollaboratorsValue = currentCollaboratorsUsage ? currentCollaboratorsUsage.value : 0
    if (plan.maxCollaborators !== null && currentCollaboratorsValue + collaboratorsCount > plan.maxCollaborators) {
        throw new PlanLimitChangeManagerRachedError(UsageMetric.COLLABORATORS)
    }

    // 5. Se passou em tudo, agora sim executamos as alterações
    // A. Incremento Progressivo (aqui podemos usar o use-case já existente se estivermos seguros)
    // Empresa
    await this.checkAndIncrementUsageUseCase.execute({
      userId: newManagerId,
      metric: UsageMetric.COMPANIES,
    })

    // Colaboradores
    for (let i = 0; i < collaboratorsCount; i++) {
        await this.checkAndIncrementUsageUseCase.execute({
            userId: newManagerId,
            metric: UsageMetric.COLLABORATORS,
        })
    }

    // 5. Transfere a Empresa
    const company = await this.companiesRepository.update({
      id: companyId,
      managerId: newManagerId,
    })

    if (!company) {
       throw new ResourceNotFoundError()
    }

    // 6. Decrementa Usage do OLD Manager
    await this.decrementUsageUseCase.execute({
      userId: oldManagerId,
      metric: UsageMetric.COMPANIES,
    })

    for (let i = 0; i < collaboratorsCount; i++) {
        await this.decrementUsageUseCase.execute({
            userId: oldManagerId,
            metric: UsageMetric.COLLABORATORS,
        })
    }

    return { company }
  }
}
