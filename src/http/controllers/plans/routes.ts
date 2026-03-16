import { FastifyInstance } from 'fastify'

import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { verifyUserRole } from '@/http/middlewares/verify-user-role'

import {
  createPlan,
  createPlanBodyResponse,
  createPlanBodySchema,
} from './createPlan'
import { planId, planIdBodyResponse, planIdBodySchema } from './planId'
import { search, searchPlansQuerySchema } from './search'
import { findPlans, findPlansQuerySchema } from './findPlans'

export async function plansRoutes(app: FastifyInstance) {
  /** Authenticated */
  app.addHook('onRequest', verifyJWT) // vai obrigar que todas as rotas abaixo tenha Token JWT Valido

  app.post(
    '/create',
    {
      schema: {
        tags: ['Plan'],
        summary: 'Cria um Novo Plano',
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
}
