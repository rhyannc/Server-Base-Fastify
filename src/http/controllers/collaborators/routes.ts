import { FastifyInstance } from 'fastify'

import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { verifyUserRole } from '@/http/middlewares/verify-user-role'

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


export async function collaboratorsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post(
    '/register',
    {
      schema: {
        tags: ['Collaborator'],
        summary: 'Cadastra um novo colaborador em uma empresa | somente usuário *ADMIN*',
        security: [{ bearerAuth: [] }],
        body: createCollaboratorBodySchema,
        response: createCollaboratorBodyResponse,
      },
      onRequest: [verifyUserRole('ADMIN')], // Pode ser limitado a ADMIN do sistema ou Manager da empresa futuramente
    },
    createCollaborator,
  )

  app.get(
    '/company/:companyId',
    {
      schema: {
        tags: ['Collaborator'],
        summary: 'Lista todos os colaboradores de uma empresa',
        security: [{ bearerAuth: [] }],
        params: findCollaboratorsByCompanyParamsSchema,
        querystring: findCollaboratorsByCompanyQuerySchema,
      },
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
        summary: 'Atualiza dados de um colaborador',
        security: [{ bearerAuth: [] }],
        params: updateCollaboratorParamsSchema,
        body: updateCollaboratorBodySchema,
      },
      onRequest: [verifyUserRole('ADMIN')], // TODO: Adicionar validação de MANAGER depois conforme fixMe.md
    },
    updateCollaborator,
  )

  app.delete(
    '/:collaboratorId',
    {
      schema: {
        tags: ['Collaborator'],
        summary: 'Remove um colaborador',
        security: [{ bearerAuth: [] }],
        params: removeCollaboratorParamsSchema,
      },
      onRequest: [verifyUserRole('ADMIN')], // TODO: Adicionar validação de MANAGER depois
    },
    removeCollaborator,
  )
}
