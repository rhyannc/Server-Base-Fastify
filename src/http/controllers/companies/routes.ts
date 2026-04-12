import { FastifyInstance } from 'fastify'

import { verifyActiveUser } from '@/http/middlewares/verify-active-user'
import { verifyChosePlan } from '@/http/middlewares/verify-chose-plan'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { verifyUserRole } from '@/http/middlewares/verify-user-role'

import {
  companyId,
  companyIdBodyResponse,
  companyIdBodySchema,
} from './companyId'
import {
  createCompany,
  createCompanyBodyResponse,
  createCompanyBodySchema,
} from './createCompany'
import { findCompanies, findCompaniesQuerySchema } from './findCompany'
import { findManager, findManagerQuerySchema } from './findManager'
import { meCollaborator, meCollaboratorQuerySchema } from './meCollaborator'
import { meManager, meQuerySchema } from './meManager'
import { search, searchCompaniesQuerySchema } from './search'
import {
  selectCompany,
  selectCompanyBodyResponse,
  selectCompanyParamsSchema,
} from './selectCompany'
import {
  toggleCompanyStatus,
  toggleCompanyStatusParamsSchema,
  toggleCompanyStatusResponseSchema,
} from './toggleCompanyStatus'
import {
  transferManagerCompany,
  transferManagerCompanyBodyResponse,
  transferManagerCompanyBodySchema,
  transferManagerCompanyParamsSchema,
} from './transferManagerCompany'
import {
  updateCompany,
  updateCompanyBodyResponse,
  updateCompanyBodySchema,
} from './updatecompany'

export async function companiesRoutes(app: FastifyInstance) {
  /** Authenticated */
  app.addHook('onRequest', verifyJWT) // vai obrigar que todas as rotas abaixo tenha Token JWT Valido
  app.addHook('onRequest', verifyActiveUser) // Valida se o usuario esta ativo, se false bloqueia todas as rotas

  app.post(
    '/create',
    {
      schema: {
        tags: ['Company'],
        summary: 'Cria uma Nova Empresa',
        security: [{ bearerAuth: [] }], // indica rota com JWT no Swager
        body: createCompanyBodySchema,
        response: createCompanyBodyResponse,
      },
      onRequest: [verifyChosePlan], // So permitir user com plano
    },
    createCompany,
  )

  app.get(
    '/:companyId',
    {
      schema: {
        tags: ['Company'],
        summary: 'Retorna dados de empresa passando o id',
        security: [{ bearerAuth: [] }],
        params: companyIdBodySchema,
        response: companyIdBodyResponse,
      },
      onRequest: [verifyChosePlan], // So permitir user com plano
    },
    companyId,
  )

  app.get(
    '/search',
    {
      schema: {
        tags: ['Company'],
        summary: 'Pesquisa todas as empresas mas somente usuário *ADMIN*',
        security: [{ bearerAuth: [] }], // indica rota com JWT no Swager
        querystring: searchCompaniesQuerySchema,
      },
      onRequest: [verifyUserRole('ADMIN'), verifyChosePlan], // So vai permitir que ADMIN executem e user com plano
    },
    search,
  )

  app.get(
    '/companies',
    {
      schema: {
        tags: ['Company'],
        summary: 'Exibe todas as empresas mas somente usuário *ADMIN*',
        security: [{ bearerAuth: [] }], // indica rota com JWT no Swager
        querystring: findCompaniesQuerySchema,
      },
      onRequest: [verifyUserRole('ADMIN'), verifyChosePlan], // So vai permitir que ADMIN executem e user com plano
    },
    findCompanies,
  )

  app.get(
    '/memanager',
    {
      schema: {
        tags: ['Company'],
        summary: 'Lista todas as empresas onde o usuário logado é o manager',
        security: [{ bearerAuth: [] }],
        querystring: meQuerySchema,
      },
      onRequest: [verifyChosePlan],
    },
    meManager,
  )

  app.get(
    '/mecollaborator',
    {
      schema: {
        tags: ['Company'],
        summary:
          'Lista todas as empresas nas quais o usuário autenticado é colaborador o Lider',
        security: [{ bearerAuth: [] }],
        querystring: meCollaboratorQuerySchema,
      },
      onRequest: [verifyChosePlan],
    },
    meCollaborator,
  )

  app.get(
    '/findmanager',
    {
      schema: {
        tags: ['Company'],
        summary:
          'Pesquisa as empresas de um usuário manager(User que cadastrou a empresa) | somente usuário *ADMIN*',
        security: [{ bearerAuth: [] }], // indica rota com JWT no Swager
        querystring: findManagerQuerySchema,
      },
      onRequest: [verifyUserRole('ADMIN'), verifyChosePlan], // So vai permitir que ADMIN executem
    },
    findManager,
  )

  app.patch(
    '/update',
    {
      schema: {
        tags: ['Company'],
        summary:
          'Atualiza uma Empresa | somente usuário *ADMIN* - LEAD - MANAGER',
        security: [{ bearerAuth: [] }], // indica rota com JWT no Swager
        body: updateCompanyBodySchema,
        response: updateCompanyBodyResponse,
      },
      onRequest: [verifyChosePlan], // So permitir user com plano
    },
    updateCompany,
  )

  app.patch(
    '/:companyId/access',
    {
      schema: {
        tags: ['Company'],
        summary: 'Registra acesso a uma empresa e valida se está ATIVA',
        security: [{ bearerAuth: [] }],
        params: selectCompanyParamsSchema,
        response: selectCompanyBodyResponse,
      },
      onRequest: [verifyChosePlan],
    },
    selectCompany,
  )

  app.patch(
    '/:companyId/status',
    {
      schema: {
        tags: ['Company'],
        summary:
          'Alterna o status de uma empresa entre ACTIVE e FROZEN | somente usuário *ADMIN* ou MANAGER da empresa',
        security: [{ bearerAuth: [] }],
        params: toggleCompanyStatusParamsSchema,
        response: toggleCompanyStatusResponseSchema,
      },
      onRequest: [verifyChosePlan],
    },
    toggleCompanyStatus,
  )

  app.patch(
    '/:companyId/transfer',
    {
      schema: {
        tags: ['Company'],
        summary:
          'Transfere a gerência de uma empresa para outro usuário | somente usuário *ADMIN*',
        security: [{ bearerAuth: [] }],
        params: transferManagerCompanyParamsSchema,
        body: transferManagerCompanyBodySchema,
        response: transferManagerCompanyBodyResponse,
      },
      onRequest: [verifyUserRole('ADMIN'), verifyChosePlan],
    },
    transferManagerCompany,
  )
}
