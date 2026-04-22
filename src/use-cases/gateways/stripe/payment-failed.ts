import { UsageMetric, UserSubscription } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'
import { UsagesRepository } from '@/repositories/usages-repository'
import { UserSubscriptionsRepository } from '@/repositories/user-subscriptions-repository'

import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'

interface PaymentFailedUseCaseRequest {
  userId: string
}

interface PaymentFailedUseCaseResponse {
  userSubscription: UserSubscription
  frozenCompanyIds: string[]
}

export class PaymentFailedUseCase {
  constructor(
    private userSubscriptionsRepository: UserSubscriptionsRepository,
    private companiesRepository: CompaniesRepository,
    private collaboratorsRepository: CollaboratorsRepository,
    private usagesRepository: UsagesRepository,
  ) {}

  async execute({
    userId,
  }: PaymentFailedUseCaseRequest): Promise<PaymentFailedUseCaseResponse> {
    // 1. Busca a assinatura do usuário
    const subscription =
      await this.userSubscriptionsRepository.findByUserId(userId)

    if (!subscription) {
      throw new ResourceNotFoundError()
    }

    // 2. Conta empresas e colaboradores ATIVOS antes de congelar
    const companies = await this.companiesRepository.findManyByManagerId(userId)
    const activeCompanies = companies.filter((c) => c.status === 'ACTIVE')
    const activeCompaniesCount = activeCompanies.length

    let activeCollaboratorsCount = 0
    for (const company of activeCompanies) {
      const collaborators = await this.collaboratorsRepository.findByCompanyId(company.id)
      activeCollaboratorsCount += collaborators.filter((c) => c.status === 'ACTIVE').length
    }

    // 3. Atualiza status da assinatura para EXPIRED
    const userSubscription = await this.userSubscriptionsRepository.update({
      id: subscription.id,
      status: 'EXPIRED',
    })

    // 4. Congela empresas ACTIVE do manager → FROZEN e retorna os IDs
    const frozenCompanyIds =
      await this.companiesRepository.updateStatusByManagerId(
        userId,
        'ACTIVE',
        'FROZEN',
      )

    // 5. Congela colaboradores ACTIVE dessas empresas → FROZEN
    await this.collaboratorsRepository.updateStatusByCompanyIds(
      frozenCompanyIds,
      'ACTIVE',
      'FROZEN',
    )

    // 6. Decrementa Usage de COMPANIES e COLLABORATORS
    const now = new Date()
    const period = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

    if (activeCompaniesCount > 0) {
      const companiesUsage = await this.usagesRepository.findByUserIdAndMetric(
        userId,
        UsageMetric.COMPANIES,
        period,
      )
      if (companiesUsage && companiesUsage.value > 0) {
        const decrementAmount = Math.min(activeCompaniesCount, companiesUsage.value)
        await this.usagesRepository.decrement(companiesUsage.id, decrementAmount)
      }
    }

    if (activeCollaboratorsCount > 0) {
      const collaboratorsUsage = await this.usagesRepository.findByUserIdAndMetric(
        userId,
        UsageMetric.COLLABORATORS,
        period,
      )
      if (collaboratorsUsage && collaboratorsUsage.value > 0) {
        const decrementAmount = Math.min(activeCollaboratorsCount, collaboratorsUsage.value)
        await this.usagesRepository.decrement(collaboratorsUsage.id, decrementAmount)
      }
    }

    console.log(
      `[Payment Failed] Empresas congeladas: ${activeCompaniesCount}, Colaboradores congelados: ${activeCollaboratorsCount}. Usage decrementado.`,
    )

    return { userSubscription, frozenCompanyIds }
  }
}
