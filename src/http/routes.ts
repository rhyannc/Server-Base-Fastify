import { FastifyInstance } from 'fastify'

import {
  autenticateBodyResponse,
  autenticateBodySchema,
  authenticate,
} from './controllers/autenticate'
import { refresh } from './controllers/refresh'
import {
  register,
  registerBodyResponse,
  registerBodySchema,
} from './controllers/register'
import {
  forgotPassword,
  forgotPasswordBodyResponse,
  forgotPasswordBodySchema,
} from './controllers/users/forgot-password'
import {
  resetPassword,
  resetPasswordBodyResponse,
  resetPasswordBodySchema,
} from './controllers/users/reset-password'
import {
  resendVerificationEmail,
  resendVerificationEmailBodyResponse,
  resendVerificationEmailBodySchema,
} from './controllers/users/resend-verification-email'
import {
  verifyEmail,
  verifyEmailBodyResponse,
  verifyEmailBodySchema,
} from './controllers/users/verify-email'

export async function appRoutes(app: FastifyInstance) {
  app.post(
    '/users',
    {
      schema: {
        tags: ['Register'],
        summary: 'Cria um novo usuário',
        body: registerBodySchema,
        response: registerBodyResponse,
      },
    },
    register,
  )

  app.post(
    '/session',
    {
      config: {
        rateLimit: {
          max: 5, // máximo de 5 tentativas
          timeWindow: '5 minutes', // por IP, a cada 5 minutos
          errorResponseBuilder: () => ({
            statusCode: 429,
            message:
              'Você exedeu o limite de requisições para essa ação, Aguarde 5 minutos para tentar novamente.',
          }),
        },
      },
      schema: {
        tags: ['Register'],
        summary: 'Authentica um usuário',
        body: autenticateBodySchema,
        response: autenticateBodyResponse,
      },
    },
    authenticate,
  )

  app.patch(
    '/token/refresh',
    { schema: { tags: ['Register'], summary: 'Rota de recriar um token' } },
    refresh,
  )

  app.post(
    '/password/forgot',
    {
      schema: {
        tags: ['Password'],
        summary: 'Solicita recuperação de senha',
        body: forgotPasswordBodySchema,
        response: forgotPasswordBodyResponse,
      },
    },
    forgotPassword,
  )

  app.patch(
    '/password/reset',
    {
      schema: {
        tags: ['Password'],
        summary: 'Redefine a senha usando o token',
        body: resetPasswordBodySchema,
        response: resetPasswordBodyResponse,
      },
    },
    resetPassword,
  )

  app.patch(
    '/users/verify-email',
    {
      schema: {
        tags: ['Register'],
        summary: 'Verifica o e-mail do usuário',
        body: verifyEmailBodySchema,
        response: verifyEmailBodyResponse,
      },
    },
    verifyEmail,
  )

  app.post(
    '/users/resend-verification',
    {
      schema: {
        tags: ['Register'],
        summary: 'Reenvia o e-mail de verificação da conta',
        body: resendVerificationEmailBodySchema,
        response: resendVerificationEmailBodyResponse,
      },
    },
    resendVerificationEmail,
  )
}
