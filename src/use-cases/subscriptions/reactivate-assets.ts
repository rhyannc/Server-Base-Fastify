import { CompaniesRepository } from '@/repositories/companies-repository'
import { UserSubscriptionsRepository } from '@/repositories/user-subscriptions-repository'
import { PlansRepository } from '@/repositories/plans-repository'
import { UsagesRepository } from '@/repositories/usages-repository'
import { ActivityLogsRepository } from '@/repositories/activity-logs-repository'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'
import { UsageMetric } from '@prisma/client'

interface ReactivateAssetsUseCaseRequest {
  userId: string
  companyIds: string[]
  ip: string
  userAgent: string
}

interface ReactivateAssetsUseCaseResponse {
  success: boolean
}

/**
 * @description Rota para reativar empresas selecionadas após o retorno de um cancelamento caso o novo plano tenha limite menor.
 * @param userId ID do usuário logado (request.user.sub)
 * @param companyIds IDs das empresas a serem reativadas
 * @returns { success: boolean } - Retorna true se a reativação for concluída com sucesso.
 * @throws { ResourceNotFoundError } - Se a assinatura não for encontrada ou os dados da assinatura não estiverem completos.
 * @throws { Error } - Se o usuário ultrapassou o limite de empresas e nenhuma empresa foi fornecida para reativação, ou se ocorreu outro erro de lógica.
 * @throws { Error } - Para qualquer outro erro inesperado.
 */
export class ReactivateAssetsUseCase {
  constructor(
    private userSubscriptionsRepository: UserSubscriptionsRepository,
    private plansRepository: PlansRepository,
    private companiesRepository: CompaniesRepository,
    private usagesRepository: UsagesRepository,
    private activityLogsRepository: ActivityLogsRepository,
  ) {}

  async execute({
    userId,
    companyIds,
    ip,
    userAgent,
  }: ReactivateAssetsUseCaseRequest): Promise<ReactivateAssetsUseCaseResponse> {
    const userSubscription = await this.userSubscriptionsRepository.findByUserId(userId)

    // Valida se a assinatura existe e se a pendência de revisão de cota está ativa
    if (!userSubscription) {
      throw new ResourceNotFoundError()
    }

    // Valida se a assinatura existe e se a pendência de revisão de cota está ativa
    if (!userSubscription.reviewQuotaReactivated) {
      throw new Error('Nenhuma pendência de revisão de cota para reativação.')
    }

    const plan = await this.plansRepository.findById(userSubscription.planId)

    // Valida se o plano existe
    if (!plan) {
      throw new ResourceNotFoundError()
    }

    // Valida se o número de empresas selecionadas não excede o limite do plano
    if (plan.maxCompanies !== null && companyIds.length > plan.maxCompanies) {
      throw new Error(`O número de empresas selecionadas (${companyIds.length}) excede o limite do plano (${plan.maxCompanies}).`)
    }

    // Valida se as empresas existem, pertencem ao usuário e estão arquivadas
    const companiesToActivate = []
    for (const companyId of companyIds) {
      const company = await this.companiesRepository.findById(companyId)
      
      if (!company) {
        throw new Error(`A empresa com ID ${companyId} não foi encontrada.`)
      }

      if (company.managerId !== userId) {
        throw new Error(`A empresa ${company.name} não pertence à sua conta.`)
      }

      if (company.status !== 'ARCHIVED') {
        throw new Error(`A empresa ${company.name} não está arquivada.`)
      }

      companiesToActivate.push(company)
    }

    // Ativa as empresas selecionadas
    for (const company of companiesToActivate) {
      await this.companiesRepository.update({
        id: company.id,
        status: 'ACTIVE',
      })

      // Registra o status change no log de atividades da reativação de empresas
      await this.activityLogsRepository.create({
        userId,
        action: 'STATUS_CHANGE_REACTIVATE',
        resource: 'COMPANY',
        resourceId: company.id,
        minidescription: `EMPRESA REATIVADA`,
        description: `Empresa ${company.id} reativada (ARCHIVED -> ACTIVE) manualmente.`,
        oldState: { status: 'ARCHIVED' },
        newState: { status: 'ACTIVE' },
        ip,
        userAgent,
      })
    }

    // Incrementa o uso de empresas
    if (companiesToActivate.length > 0) {
      const now = new Date()
      const period = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

      const companiesUsage = await this.usagesRepository.findByUserIdAndMetric(
        userId,
        UsageMetric.COMPANIES,
        period,
      )

      if (companiesUsage) {
        await this.usagesRepository.increment(companiesUsage.id, companiesToActivate.length)
      } else {
        await this.usagesRepository.create({
          userId,
          metric: UsageMetric.COMPANIES,
          period,
          value: companiesToActivate.length,
        })
      }
    }

    // Marca a pendência como resolvida
    await this.userSubscriptionsRepository.update({
      id: userSubscription.id,
      reviewQuotaReactivated: false,
    })

    return {
      success: true,
    }
  }
}
