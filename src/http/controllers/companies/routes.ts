import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { verifyUserRole } from '@/http/middlewares/verify-user-role'
import { verifyChosePlan } from '@/http/middlewares/verify-chose-plan'

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
import { findManager, findManagerQuerySchema } from './findManager'
import { search, searchCompaniesQuerySchema } from './search'
import { updateCompany, updateCompanyBodyResponse, updateCompanyBodySchema } from './updatecompany'
import { findCompanies, findCompaniesQuerySchema } from './findCompany'
import { selectCompany, selectCompanyBodyResponse, selectCompanyParamsSchema } from './selectCompany'
import { verifyActiveUser } from '@/http/middlewares/verify-active-user'

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
    '/company/:companyId',
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
        summary: 'Atualiza uma Empresa | somente usuário *ADMIN* - LEAD - MANAGER', 
        security: [{ bearerAuth: [] }], // indica rota com JWT no Swager
        body: updateCompanyBodySchema,
        response: updateCompanyBodyResponse,
      },
      onRequest: [verifyChosePlan], // So permitir user com plano
    },
    updateCompany,
  )

  app.patch(
    '/company/:companyId/access',
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
  
}
