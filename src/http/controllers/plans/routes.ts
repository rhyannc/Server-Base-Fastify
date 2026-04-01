import { FastifyInstance } from 'fastify'

import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { verifyUserRole } from '@/http/middlewares/verify-user-role'

import {
  createPlan,
  createPlanBodyResponse,
  createPlanBodySchema,
} from './createPlan'
import { findPlans, findPlansQuerySchema } from './findPlans'
import { planId, planIdBodyResponse, planIdBodySchema } from './planId'
import { search, searchPlansQuerySchema } from './search'
import {
  updatePlan,
  updatePlanBodyResponse,
  updatePlanBodySchema,
} from './updatePlan'
import { verifyActiveUser } from '@/http/middlewares/verify-active-user'
import { checkout, checkoutBodySchema } from './checkout'
import { portal, portalBodySchema } from './portal'

export async function plansRoutes(app: FastifyInstance) {
  /** Authenticated */
  app.addHook('onRequest', verifyJWT) // vai obrigar que todas as rotas abaixo tenha Token JWT Valido
  app.addHook('onRequest', verifyActiveUser) // Valida se o usuario esta ativo, se false bloqueia todas as rotas

  app.post(
    '/create',
    {
      schema: {
        tags: ['Plan'],
        summary: 'Cria um Novo Plano | somente usuário *ADMIN*',
        security: [{ bearerAuth: [] }], // indica rota com JWT no Swager
        body: createPlanBodySchema,
        response: createPlanBodyResponse,
      },
      onRequest: [verifyUserRole('ADMIN')], // So vai permitir que ADMIN executem
    },
    createPlan,
  )

  app.get(
    '/plan/:planId',
    {
      schema: {
        tags: ['Plan'],
        summary: 'Retorna dados do plano passando o id',
        params: planIdBodySchema,
        response: planIdBodyResponse,
      },
    },
    planId,
  )

  app.get(
    '/search',
    {
      schema: {
        tags: ['Plan'],
        summary: 'Pesquisa todos os planos mas somente usuário *ADMIN*',
        security: [{ bearerAuth: [] }], // indica rota com JWT no Swager
        querystring: searchPlansQuerySchema,
      },
      onRequest: [verifyUserRole('ADMIN')], // So vai permitir que ADMIN executem
    },
    search,
  )

  app.get(
    '/plans',
    {
      schema: {
        tags: ['Plan'],
        summary: 'Retorna todos os planos Ativos',
        querystring: findPlansQuerySchema,
      },
    },
    findPlans,
  )

  app.patch(
    '/update',
    {
      schema: {
        tags: ['Plan'],
        summary: 'Atualiza um Plano | somente usuário *ADMIN*',
        security: [{ bearerAuth: [] }], // indica rota com JWT no Swager
        body: updatePlanBodySchema,
        response: updatePlanBodyResponse,
      },
      onRequest: [verifyUserRole('ADMIN')], // So vai permitir que ADMIN executem
    },
    updatePlan,
  )

  app.post(
    '/checkout',
    {
      schema: {
        tags: ['Plan'],
        summary: 'Gera link de pagamento no Stripe Checkout',
        security: [{ bearerAuth: [] }],
        body: checkoutBodySchema,
      },
    },
    checkout,
  )

  app.post(
    '/portal',
    {
      schema: {
        tags: ['Plan'],
        summary: 'Gera link do Customer Portal do Stripe',
        security: [{ bearerAuth: [] }],
        body: portalBodySchema,
      },
    },
    portal,
  )
}
