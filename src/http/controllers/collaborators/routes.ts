import { FastifyInstance } from 'fastify'

import { verifyJWT } from '@/http/middlewares/verify-jwt'

import {
  createCollaborator,
  createCollaboratorBodyResponse,
  createCollaboratorBodySchema,
} from './createCollaborator'
import {
  findCollaboratorsByCompany,
  findCollaboratorsByCompanyParamsSchema,
  findCollaboratorsByCompanyQuerySchema,
} from './findCollaboratorsByCompany'
import {
  findCompaniesByUser,
  findCompaniesByUserQuerySchema,
} from './findCompaniesByUser'
import {
  removeCollaborator,
  removeCollaboratorParamsSchema,
} from './removeCollaborator'
import {
  updateCollaborator,
  updateCollaboratorBodySchema,
  updateCollaboratorParamsSchema,
} from './updateCollaborator'
import { verifyActiveUser } from '@/http/middlewares/verify-active-user'
import { verifyCompanyActive } from '@/http/middlewares/verify-company-active'


export async function collaboratorsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)
  app.addHook('onRequest', verifyActiveUser) // Valida se o usuario esta ativo, se false bloqueia todas as rotas

  app.post(
    '/register',
    {
      schema: {
        tags: ['Collaborator'],
        summary: 'Cadastra um novo colaborador em uma empresa | somente usuário *ADMIN* - LEAD - MANAGER',
        security: [{ bearerAuth: [] }],
        body: createCollaboratorBodySchema,
        response: createCollaboratorBodyResponse,
      },
      preHandler: [verifyCompanyActive], // Bloqueia se a empresa estiver FROZEN ou ARCHIVED
    },
    createCollaborator,
  )

  app.get(
    '/company/:companyId',
    {
      schema: {
        tags: ['Collaborator'],
        summary: 'Lista todos os colaboradores de uma empresa | somente usuário *ADMIN* - LEAD - MANAGER',
        security: [{ bearerAuth: [] }],
        params: findCollaboratorsByCompanyParamsSchema,
        querystring: findCollaboratorsByCompanyQuerySchema,
      },
      preHandler: [verifyCompanyActive], // Bloqueia se a empresa estiver FROZEN ou ARCHIVED
    },
    findCollaboratorsByCompany,
  )

  app.get(
    '/me',
    {
      schema: {
        tags: ['Collaborator'],
        summary: 'Lista todas as empresas nas quais o usuário autenticado é colaborador',
        security: [{ bearerAuth: [] }],
        querystring: findCompaniesByUserQuerySchema,
      },
    },
    findCompaniesByUser,
  )

  app.patch(
    '/:collaboratorId',
    {
      schema: {
        tags: ['Collaborator'],
        summary: 'Atualiza dados de um colaborador | somente usuário *ADMIN* - LEAD - MANAGER',
        security: [{ bearerAuth: [] }],
        params: updateCollaboratorParamsSchema,
        body: updateCollaboratorBodySchema,
      },
    },
    updateCollaborator,
  )

  app.delete(
    '/:collaboratorId',
    {
      schema: {
        tags: ['Collaborator'],
        summary: 'Remove um colaborador | somente usuário *ADMIN* - LEAD - MANAGER',
        security: [{ bearerAuth: [] }],
        params: removeCollaboratorParamsSchema,
      },
    },
    removeCollaborator,
  )
}
