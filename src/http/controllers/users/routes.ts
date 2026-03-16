import { FastifyInstance } from 'fastify'

import { verifyJWT } from '@/http/middlewares/verify-jwt'

import { verifyUserRole } from '@/http/middlewares/verify-user-role'

import { findUsers, findUsersQuerySchema } from './findUsers'
import { meBodyResponse, profile } from './profile'
import { search, searchUsersQuerySchema } from './search'
import {
  updateProfile,
  updateProfileBodyResponse,
  updateProfileBodySchema,
} from './updateProfile'
import {
  updateUser,
  updateUserBodyResponse,
  updateUserBodySchema,
} from './updateUser'
import { userId, userIdBodyResponse, userIdBodySchema } from './userId'

export async function usersRoutes(app: FastifyInstance) {
  /** Authenticated */
  app.addHook('onRequest', verifyJWT) // vai obrigar que todas as rotas abaixo tenha Token JWT Valido

  app.get(
    '/me',
    {
      schema: {
        tags: ['User'],
        summary: 'Retorna dados do usuario logado, usando o id no bearer token',
        security: [{ bearerAuth: [] }],
        response: meBodyResponse,
      },
    },
    profile,
  )

  app.get(
    '/user/:userId',
    {
      schema: {
        tags: ['User'],
        summary: 'Retorna dados do usuario passando o id',
        security: [{ bearerAuth: [] }],
        params: userIdBodySchema,
        response: userIdBodyResponse,
      },
    },
    userId,
  )

  app.get(
    '/users',
    {
      schema: {
        tags: ['User'],
        summary: 'Retorna todos os usuários | somente usuário *ADMIN*',
        security: [{ bearerAuth: [] }],
        querystring: findUsersQuerySchema,
      },
      onRequest: [verifyUserRole('ADMIN')],
    },
    findUsers,
  )

  app.get(
    '/search',
    {
      schema: {
        tags: ['User'],
        summary: 'Pesquisa usuários (nome ou email) | somente usuário *ADMIN*',
        security: [{ bearerAuth: [] }],
        querystring: searchUsersQuerySchema,
      },
      onRequest: [verifyUserRole('ADMIN')],
    },
    search,
  )

  app.patch(
    '/profile',
    {
      schema: {
        tags: ['User'],
        summary: 'Atualiza dados do perfil do usuário logado',
        security: [{ bearerAuth: [] }],
        body: updateProfileBodySchema,
        response: updateProfileBodyResponse,
      },
    },
    updateProfile,
  )

  app.patch(
    '/update',
    {
      schema: {
        tags: ['User'],
        summary: 'Atualiza dados do usuário | somente usuário *ADMIN*',
        security: [{ bearerAuth: [] }],
        body: updateUserBodySchema,
        response: updateUserBodyResponse,
      },
      onRequest: [verifyUserRole('ADMIN')],
    },
    updateUser,
  )
}
