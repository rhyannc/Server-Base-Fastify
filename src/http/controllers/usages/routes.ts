import { FastifyInstance } from 'fastify'

import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { verifyUserRole } from '@/http/middlewares/verify-user-role'

import { metrics } from './metrics'
import {
  updateMetric,
  updateMetricBodySchema,
  updateMetricParamsSchema,
} from './update-metric'
import { userMetrics, userMetricsParamsSchema } from './user-metrics'

export async function usagesRoutes(app: FastifyInstance) {
  // Todas as rotas de usos precisam de autenticação
  app.addHook('onRequest', verifyJWT)

  // O próprio usuário consulta seus usos
  app.get(
    '/me',
    {
      schema: {
        tags: ['Usages'],
        summary: 'Consulta os usos (métricas) do usuário logado',
        security: [{ bearerAuth: [] }],
      },
    },
    metrics,
  )

  // Apenas ADMIN consulta os usos de qualquer usuário
  app.get(
    '/:userId',
    {
      onRequest: [verifyUserRole('ADMIN')],
      schema: {
        tags: ['Usages'],
        summary: 'Consulta os usos (métricas) de um determinado usuário (Apenas ADMIN)',
        security: [{ bearerAuth: [] }],
        params: userMetricsParamsSchema,
      },
    },
    userMetrics,
  )

  // Apenas ADMIN atualiza os usos de qualquer usuário
  app.patch(
    '/:userId/metrics/:metric',
    {
      onRequest: [verifyUserRole('ADMIN')],
      schema: {
        tags: ['Usages'],
        summary: 'Força a atualização/correção do valor de uma métrica de um usuário (Apenas ADMIN)',
        security: [{ bearerAuth: [] }],
        params: updateMetricParamsSchema,
        body: updateMetricBodySchema,
      },
    },
    updateMetric,
  )
}
