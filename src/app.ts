import fastifyCookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { ZodError } from 'zod'

import { env } from './env'
import { collaboratorsRoutes } from './http/controllers/collaborators/routes'
import { companiesRoutes } from './http/controllers/companies/routes'
import { plansRoutes } from './http/controllers/plans/routes'
import { usagesRoutes } from './http/controllers/usages/routes'
import { userSubscriptionsRoutes } from './http/controllers/user-subscriptions/routes'
import { usersRoutes } from './http/controllers/users/routes'
import { appRoutes } from './http/routes'
import { webhooksRoutes } from './http/controllers/webhooks/routes'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

// zod <-> fastify
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

import fastifyRawBody from 'fastify-raw-body' // Plugin para ler o body da requisição

app.register(fastifyCookie)
app.register(fastifyRawBody, {
  field: 'rawBody',
  global: false,
  encoding: 'utf8',
  runFirst: true,
})

// Habilita rate limit (necessário para as configs por rota funcionarem)
app.register(fastifyRateLimit, {
  global: false, // se false; cada rota define seu próprio limite
  /* max: 100,
     timeWindow: '1 minute',*/
})

// Registro do JWT
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
  },
  sign: { expiresIn: '15d' },
})

// Swagguer Para documentar as Api
app.register(fastifySwagger, {
  openapi: {
    info: { title: 'API', version: '1.0.0' },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      }, 
    },
  },

  transform: jsonSchemaTransform, // <-- transforma Zod em JSON Schema para o Swagger
})

// Interface Visual do Swagger
app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: { docExpansion: 'list' }, //lista: fecha os itens, list: abre os itens
})

// Registra as rotas da aplicação
app.register(appRoutes)
app.register(usersRoutes, { prefix: '/user' })
app.register(companiesRoutes, { prefix: '/company' })
app.register(plansRoutes, { prefix: '/plan' })
app.register(collaboratorsRoutes, { prefix: '/collaborator' })
app.register(userSubscriptionsRoutes, { prefix: '/subscriptions' })
app.register(usagesRoutes, { prefix: '/usages' })
app.register(webhooksRoutes, { prefix: '/webhooks' })

// Rota para testar se a API está funcionando
app.get(
  '/',
  async (request, reply) => {
    return reply.status(200).send('It Works!')
  },
)


// TRATAMENTO DE ERROS DE FORMA GLOBAL
app.setErrorHandler((error, _req, reply) => {
  // 1) Erros de validação disparados pelo Fastify/ZodTypeProvider nas rotas
  if ((error as any)?.code === 'FST_ERR_VALIDATION') {
    const cause = (error as any).cause
    if (cause instanceof ZodError) {
      return reply.status(400).send({
        message: 'Validation error.',
        issues: cause.format(),
      })
    }
    // fallback: caso não seja ZodError
    return reply.status(400).send({
      message: 'Validation error.',
      issues: (error as any).message,
    })
  }

  // 2) Erros Zod disparados manualmente no controller (quando se usa .parse direto no body)
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error.',
      issues: error.format(),
    })
  }

  // 3) Demais erros (Erros 500 ou não mapeados)
  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // TODO: Aqui a gente deveria fazer log para uma ferramenta externa (ex: Datadog / NewRelic / Sentry)
  }

  return reply.status(500).send({ message: 'Internal Server Error.' })
}
)
