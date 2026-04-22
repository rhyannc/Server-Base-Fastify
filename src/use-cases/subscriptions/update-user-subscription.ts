import { Company, Plan, SubscriptionStatus, UserSubscription } from '@prisma/client'

import { CollaboratorsRepository } from '@/repositories/collaborators-repository'
import { CompaniesRepository } from '@/repositories/companies-repository'
import { PlansRepository } from '@/repositories/plans-repository'
import { UsagesRepository } from '@/repositories/usages-repository'
import { UserSubscriptionsRepository } from '@/repositories/user-subscriptions-repository'

import { stripe } from '@/providers/stripe-provider'
import { PlanNotActiveError } from '../errors/plan-not-active-error'
import { ResourceNotFoundError } from '../errors/resource-not-found-error'

interface UpdateUserSubscriptionUseCaseRequest {
  userId: string
  planId?: string

}

interface UpdateUserSubscriptionUseCaseResponse {
  userSubscription: UserSubscription
}

export class UpdateUserSubscriptionUseCase {
  constructor(
    private userSubscriptionsRepository: UserSubscriptionsRepository,
    private plansRepository: PlansRepository,
    private companiesRepository: CompaniesRepository,
    private collaboratorsRepository: CollaboratorsRepository,
    private usagesRepository: UsagesRepository,
  ) {}

  async execute({
    userId,
    planId,

  }: UpdateUserSubscriptionUseCaseRequest): Promise<UpdateUserSubscriptionUseCaseResponse> {

    // Verifica se o usuario ja tem plano
    const userSubscription =
      await this.userSubscriptionsRepository.findByUserId(userId)
    if (!userSubscription) {
      throw new ResourceNotFoundError()
    }

    // verificar se o plano existe e se está ativo
    if (planId && planId !== userSubscription.planId) {
      const plan = await this.plansRepository.findById(planId)
      if (!plan) {
        throw new ResourceNotFoundError()
      }

      if (!plan.isActive) {
        throw new PlanNotActiveError()
      }

      // Se o usuário tem uma assinatura no Stripe, atualiza lá primeiro
      if (userSubscription.stripeSubscriptionId && plan.stripePriceId) {
        const subscription = await stripe.subscriptions.retrieve(
          userSubscription.stripeSubscriptionId,
        )

        // Atualiza a assinatura no Stripe com o novo preço e cobrança pró-rata imediata
        await stripe.subscriptions.update(userSubscription.stripeSubscriptionId, {
          items: [
            {
              id: subscription.items.data[0].id,
              price: plan.stripePriceId,
            },
          ],
          proration_behavior: 'always_invoice',
        })

        userSubscription.stripePriceId = plan.stripePriceId
      }

      userSubscription.planId = planId
    }


    const updatedSubscription = await this.userSubscriptionsRepository.update({
      id: userSubscription.id,
      planId: userSubscription.planId,
      status: userSubscription.status,
      stripePriceId: userSubscription.stripePriceId,
      cardLast4: userSubscription.cardLast4,
      cardBrand: userSubscription.cardBrand,
      paymentMethodId: userSubscription.paymentMethodId,
    })

    // Lógica de Downgrade: Verificar limites do novo plano
    const plan = await this.plansRepository.findById(
      updatedSubscription.planId,
    )

    if (plan) {
      // 1. Verificar limite de Empresas (maxCompanies)
      // Usage só rastreia empresas ACTIVE, então só consideramos ACTIVE no downgrade
      if (plan.maxCompanies) {
        const companies = await this.companiesRepository.findManyByManagerId(
          userId,
        )
        const activeCompanies = companies.filter(
          (c) => c.status === 'ACTIVE',
        )

        if (activeCompanies.length > plan.maxCompanies) {
          // As empresas já vêm ordenadas por lastAccess DESC no repository
          // Mantém as mais recentemente acessadas, arquiva o restante
          const companiesToArchive = activeCompanies.slice(plan.maxCompanies)
          const companyIdsToArchive = companiesToArchive.map((c: Company) => c.id)

          for (const companyId of companyIdsToArchive) {
            await this.companiesRepository.update({
              id: companyId,
              status: 'ARCHIVED',
            })

            // Arquiva colaboradores ACTIVE dessas empresas
            await this.collaboratorsRepository.updateStatusByCompanyIds(
              [companyId],
              ['ACTIVE'],
              'ARCHIVED',
            )
          }
        }
      }

      // 2. Verificar limite de Colaboradores (maxCollaborators)
      // Usage só rastreia colaboradores ACTIVE, então só consideramos ACTIVE no downgrade
      if (plan.maxCollaborators) {
        const activeCollaboratorsCount =
          await this.collaboratorsRepository.countActiveByManagerId(userId)

        if (activeCollaboratorsCount > plan.maxCollaborators) {
          const collaborators =
            await this.collaboratorsRepository.findManyByManagerId(userId)
          
          // Filtra apenas os ACTIVE (já que as empresas arquivadas acima já tiveram seus colaboradores arquivados)
          const activeCollaborators = collaborators.filter(
            (c) => c.status === 'ACTIVE',
          )

          if (activeCollaborators.length > plan.maxCollaborators) {
            // Ordena por lastLoginAt DESC (quem fez login mais recente fica, quem nunca fez login é arquivado primeiro)
            const sortedCollaborators = activeCollaborators.sort(
              (a, b) => {
                if (a.user.lastLoginAt === b.user.lastLoginAt) return 0
                if (a.user.lastLoginAt === null) return 1
                if (b.user.lastLoginAt === null) return -1
                return b.user.lastLoginAt.getTime() - a.user.lastLoginAt.getTime()
              },
            )

            const collaboratorsToArchive = sortedCollaborators.slice(
              plan.maxCollaborators,
            )

            for (const collaborator of collaboratorsToArchive) {
              await this.collaboratorsRepository.update({
                id: collaborator.id,
                status: 'ARCHIVED',
              })
            }
          }
        }
      }

      // 3. Sincronizar Uso (Usage)
      const now = new Date()
      const currentPeriod = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

      // COMPANIES
      const finalCompanies = await this.companiesRepository.findManyByManagerId(userId)
      const finalActiveCompaniesCount = finalCompanies.filter(c => c.status === 'ACTIVE').length
      
      const companiesUsage = await this.usagesRepository.findByUserIdAndMetric(userId, 'COMPANIES', currentPeriod)
      if (companiesUsage) {
        await this.usagesRepository.setValue(companiesUsage.id, finalActiveCompaniesCount)
      } else {
        await this.usagesRepository.create({
          userId,
          metric: 'COMPANIES',
          period: currentPeriod,
          value: finalActiveCompaniesCount,
        })
      }

      // COLLABORATORS
      const finalActiveCollaboratorsCount = await this.collaboratorsRepository.countActiveByManagerId(userId)
      
      const collaboratorsUsage = await this.usagesRepository.findByUserIdAndMetric(userId, 'COLLABORATORS', currentPeriod)
      if (collaboratorsUsage) {
        await this.usagesRepository.setValue(collaboratorsUsage.id, finalActiveCollaboratorsCount)
      } else {
        await this.usagesRepository.create({
          userId,
          metric: 'COLLABORATORS',
          period: currentPeriod,
          value: finalActiveCollaboratorsCount,
        })
      }
    }

    return { userSubscription: updatedSubscription }
  }
}
