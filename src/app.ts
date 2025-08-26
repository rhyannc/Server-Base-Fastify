import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { z, ZodError } from 'zod'

import { env } from './env'
import { appRoutes } from './http/routes'

export const app = fastify().withTypeProvider()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Swagguer Para documentar as Api
app.register(fastifySwagger, {
  openapi: { info: { title: 'API', version: '1.0.0' } },
  transform: jsonSchemaTransform, // <-- transforma Zod em JSON Schema para o Swagger
})

// Interface Visual do Swagger
app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: { docExpansion: 'list' },
})

// Registra as rotas da aplicação
app.register(appRoutes)

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
app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validate error.', issues: error.format() })
  }

  if (env.NODE_ENV === 'production') {
    console.error(error)
  } else {
    // Implementacao futura para Monitoramento de erro DataDog/Sentry
  }

  return reply.status(500).send({ message: 'Internal Server Error.' })
})
