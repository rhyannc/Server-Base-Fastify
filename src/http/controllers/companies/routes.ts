import { FastifyInstance } from 'fastify'

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
import { findManager, findManagerQuerySchema } from './findManager'
import { search, searchCompanysQuerySchema } from './search'
import { updateCompany, updateCompanyBodyResponse, updateCompanyBodySchema } from './updatecompany'
import { findCompanies, findCompaniesQuerySchema } from './findCompany'

export async function companiesRoutes(app: FastifyInstance) {
  /** Authenticated */
  app.addHook('onRequest', verifyJWT) // vai obrigar que todas as rotas abaixo tenha Token JWT Valido

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
        querystring: searchCompanysQuerySchema,
      },
      onRequest: [verifyUserRole('ADMIN')], // So vai permitir que ADMIN executem
    },
    search,
  )

  app.get(
    '/companies',
    {
      schema: {
        tags: ['Company'],
        summary: 'Pesquisa todas as empresas mas somente usuário *ADMIN*',
        security: [{ bearerAuth: [] }], // indica rota com JWT no Swager
        querystring: findCompaniesQuerySchema,
      },
      onRequest: [verifyUserRole('ADMIN')], // So vai permitir que ADMIN executem
    },
    findCompanies,
  )

  app.get(
    '/findmanager',
    {
      schema: {
        tags: ['Company'],
        summary:
          'Pesquisa as empresas de um usuário manager(User que cadastrou a empresa)',
        security: [{ bearerAuth: [] }], // indica rota com JWT no Swager
        querystring: findManagerQuerySchema,
      },
    },
    findManager,
  )

  app.patch(
    '/update',
    {
      schema: {
        tags: ['Company'],
        summary: 'Atualiza uma Empresa - FIX FIX FIX', /** FIX Tenho que atualizar recurso para que so ao Manager e ao Admin possa atualizar a empresa */
        security: [{ bearerAuth: [] }], // indica rota com JWT no Swager
        body: updateCompanyBodySchema,
        response: updateCompanyBodyResponse,
      },
    },
    updateCompany,
  )
  
}
