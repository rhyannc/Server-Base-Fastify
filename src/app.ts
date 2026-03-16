import fastifyCookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { z } from 'zod'

import { env } from './env'
import { companiesRoutes } from './http/controllers/companies/routes'
import { plansRoutes } from './http/controllers/plans/routes'
import { usersRoutes } from './http/controllers/users/routes'
import { appRoutes } from './http/routes'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

// zod <-> fastify
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCookie)

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
  uiConfig: { docExpansion: 'list' },
})

// Registra as rotas da aplicação
app.register(appRoutes)
app.register(usersRoutes, { prefix: '/user' })
app.register(companiesRoutes, { prefix: '/company' })
app.register(plansRoutes, { prefix: '/plan' })

app.get(
  '/cou/:id',
  {
    schema: {
      params: z.object({
        id: z.string(),
      }),
    },
  },
  async (request, reply) => {
    const id = 'Meu ovo'
    return reply.status(200).send({ id })
  },
)

// TRATAMENTO DE ERROS DE FORMA GLOBAL
/*
app.setErrorHandler((error, _req, reply) => {
  // 1) Erros de validação disparados pelo Fastify (quando schema.body/params/… falha)
  if ((error as any)?.code === 'FST_ERR_VALIDATION') {
    const cause = (error as any).cause
    if (cause instanceof ZodError) {
      return reply.status(400).send({
        message: 'Validation error.',
        issues: cause.flatten(), // ou cause.format()
      })
    }
    // fallback: caso não seja ZodError por algum motivo
    return reply.status(400).send({
      message: 'Validation error!',
      issues: (error as any).message,
    })
  }

  // 2) Erros Zod disparados manualmente no handler (parse/safeParse)
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error.',
      // issues: error.flatten(),
    })
  }

  // Demais erros
  if (env.NODE_ENV !== 'production') {
    console.error(error)
  }
  return reply.status(500).send({ message: 'Internal Server Error.' })
})

/**
VALIDA ERRO GLOBAL
app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error.', issues: error.format() })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // TODO: Here we should log to a external tool like DataDog/NewRelic/Sentry
  }

  return reply.status(500).send({ message: 'Internal server error.' })
})

*/
