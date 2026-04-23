import { Company, Role, Status, UsageMetric } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'
import { PlansRepository } from '@/repositories/plans-repository'
import { UsagesRepository } from '@/repositories/usages-repository'
import { UserSubscriptionsRepository } from '@/repositories/user-subscriptions-repository'
import { ActivityLogsRepository } from '@/repositories/activity-logs-repository'

import { CompanyNoExistError } from '../errors/company-no-exist-error'
import { OnlyAdminAuthorizedError } from '../errors/only-admin-authorized-error'
import { PlanLimitReachedError } from '../errors/plan-limit-reached-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface ToggleCompanyStatusUseCaseRequest {
  id: string
  meId: string
  meSysRole: Role
  ip?: string
  userAgent?: string
}

interface ToggleCompanyStatusUseCaseResponse {
  company: Company
}

export class ToggleCompanyStatusUseCase {
  constructor(
    private companiesRepository: CompaniesRepository,
    private collaboratorsRepository: CollaboratorsRepository,
    private userSubscriptionsRepository: UserSubscriptionsRepository,
    private plansRepository: PlansRepository,
    private usagesRepository: UsagesRepository,
    private activityLogsRepository: ActivityLogsRepository,
  ) {}

  async execute({
    id,
    meId,
    meSysRole,
    ip,
    userAgent,
  }: ToggleCompanyStatusUseCaseRequest): Promise<ToggleCompanyStatusUseCaseResponse> {
    const companyExists = await this.companiesRepository.findById(id)
    if (!companyExists) {
      throw new CompanyNoExistError()
    }

    // Somente o ADMIN ou o MANAGER da empresa podem alterar seu status.
    if (meSysRole !== 'ADMIN' && companyExists.managerId !== meId) {
      throw new OnlyAdminAuthorizedError()
    }

    // Empresas ARCHIVED não podem ter seu status alterado por esta rota.
    if (companyExists.status === 'ARCHIVED') {
      throw new Error('Empresas arquivadas não podem ter seu status alterado por esta rota.')
    }

    const managerId = companyExists.managerId
    const now = new Date()
    const period = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

    // Busca colaboradores ACTIVE ou FROZEN desta empresa
    const companyCollaborators = await this.collaboratorsRepository.findByCompanyId(id)
    const activeOrFrozenCollaborators = companyCollaborators.filter(
      (c) => c.status === 'ACTIVE' || c.status === 'FROZEN',
    )
    const collaboratorsCount = activeOrFrozenCollaborators.length

    // =============================================
    // ACTIVE → FROZEN (Congelar)
    // =============================================
    if (companyExists.status === 'ACTIVE') {
      // 1. Altera status da empresa para FROZEN
      const company = await this.companiesRepository.update({
        id,
        status: 'FROZEN',
      })

      // 2. Congela os colaboradores dessa empresa
      if (collaboratorsCount > 0) {
        await this.collaboratorsRepository.updateStatusByCompanyIds(
          [id],
          ['ACTIVE'],
          'FROZEN',
        )
      }

      // 3. Decrementa usage de COMPANIES (-1)
      const companiesUsage = await this.usagesRepository.findByUserIdAndMetric(
        managerId,
        UsageMetric.COMPANIES,
        period,
      )
      if (companiesUsage && companiesUsage.value > 0) {
        await this.usagesRepository.decrement(companiesUsage.id, 1)
      }

      // 4. Decrementa usage de COLLABORATORS (-N)
      if (collaboratorsCount > 0) {
        const collaboratorsUsage = await this.usagesRepository.findByUserIdAndMetric(
          managerId,
          UsageMetric.COLLABORATORS,
          period,
        )
        if (collaboratorsUsage && collaboratorsUsage.value > 0) {
          const decrementAmount = Math.min(collaboratorsCount, collaboratorsUsage.value)
          await this.usagesRepository.decrement(collaboratorsUsage.id, decrementAmount)
        }
      }

      console.log(
        `[Toggle Status] Empresa ${id} congelada. Usage decrementado: COMPANIES -1, COLLABORATORS -${collaboratorsCount}`,
      )

      // Registra o status change no log de atividades
      await this.activityLogsRepository.create({
        userId: meId,
        action: 'STATUS_CHANGE',
        resource: 'COMPANY',
        resourceId: id,
        minidescription: `EMPRESA CONGELADA`,
        description: `Empresa ${id} congelada (ACTIVE -> FROZEN) por ${meId}.`,
        oldState: { status: 'ACTIVE' },
        newState: { status: 'FROZEN' },
        ip,
        userAgent,
      })

      return { company }
    }

    // =============================================
    // FROZEN → ACTIVE (Descongelar)
    // =============================================
    if (companyExists.status === 'FROZEN') {
      // 1. Busca assinatura e plano do manager
      const subscription = await this.userSubscriptionsRepository.findByUserId(managerId)
      if (!subscription) {
        throw new ResourceNotFoundError()
      }

      const plan = await this.plansRepository.findById(subscription.planId)
      if (!plan) {
        throw new ResourceNotFoundError()
      }

      // 2. Verifica limite de COMPANIES
      if (plan.maxCompanies !== null) {
        const companiesUsage = await this.usagesRepository.findByUserIdAndMetric(
          managerId,
          UsageMetric.COMPANIES,
          period,
        )
        const currentCompaniesValue = companiesUsage ? companiesUsage.value : 0

        if (currentCompaniesValue + 1 > plan.maxCompanies) {
          throw new PlanLimitReachedError(UsageMetric.COMPANIES)
        }
      }

      // 3. Verifica limite de COLLABORATORS
      if (plan.maxCollaborators !== null && collaboratorsCount > 0) {
        const collaboratorsUsage = await this.usagesRepository.findByUserIdAndMetric(
          managerId,
          UsageMetric.COLLABORATORS,
          period,
        )
        const currentCollaboratorsValue = collaboratorsUsage ? collaboratorsUsage.value : 0

        if (currentCollaboratorsValue + collaboratorsCount > plan.maxCollaborators) {
          throw new PlanLimitReachedError(UsageMetric.COLLABORATORS)
        }
      }

      // 4. Se passou nas verificações, ativa a empresa
      const company = await this.companiesRepository.update({
        id,
        status: 'ACTIVE',
      })

      // 5. Reativa os colaboradores congelados dessa empresa
      if (collaboratorsCount > 0) {
        await this.collaboratorsRepository.updateStatusByCompanyIds(
          [id],
          ['FROZEN'],
          'ACTIVE',
        )
      }

      // 6. Incrementa usage de COMPANIES (+1)
      const companiesUsage = await this.usagesRepository.findByUserIdAndMetric(
        managerId,
        UsageMetric.COMPANIES,
        period,
      )
      if (companiesUsage) {
        await this.usagesRepository.increment(companiesUsage.id, 1)
      } else {
        await this.usagesRepository.create({
          userId: managerId,
          metric: UsageMetric.COMPANIES,
          period,
          value: 1,
        })
      }

      // 7. Incrementa usage de COLLABORATORS (+N)
      if (collaboratorsCount > 0) {
        const collaboratorsUsage = await this.usagesRepository.findByUserIdAndMetric(
          managerId,
          UsageMetric.COLLABORATORS,
          period,
        )
        if (collaboratorsUsage) {
          await this.usagesRepository.increment(collaboratorsUsage.id, collaboratorsCount)
        } else {
          await this.usagesRepository.create({
            userId: managerId,
            metric: UsageMetric.COLLABORATORS,
            period,
            value: collaboratorsCount,
          })
        }
      }

      console.log(
        `[Toggle Status] Empresa ${id} reativada. Usage incrementado: COMPANIES +1, COLLABORATORS +${collaboratorsCount}`,
      )

      // Registra o status change no log de atividades
      await this.activityLogsRepository.create({
        userId: meId,
        action: 'STATUS_CHANGE',
        resource: 'COMPANY',
        resourceId: id,
        minidescription: `EMPRESA REATIVADA`,
        description: `Empresa ${id} reativada (FROZEN -> ACTIVE) por ${meId}.`,
        oldState: { status: 'FROZEN' },
        newState: { status: 'ACTIVE' },
        ip,
        userAgent,
      })

      return { company }
    }

    // Fallback (não deveria chegar aqui por causa do guard acima)
    const company = await this.companiesRepository.update({
      id,
      status: 'ACTIVE',
    })

    return { company }
  }
}
