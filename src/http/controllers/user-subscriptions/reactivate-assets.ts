import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeReactivateAssetsUseCase } from '@/use-cases/factories/make-reactivate-assets-use-case'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'

export const reactivateAssetsBodySchema = z.object({
  companyIds: z.array(z.string().uuid()).min(1, 'Selecione pelo menos uma empresa'),
})

export const reactivateAssetsResponseSchema = {
  200: z.object({
    success: z.boolean(),
  }),
  400: z.object({
    message: z.string(),
  }),
  404: z.object({
    message: z.string(),
  }),
}

/**
 * @description Rota para reativar empresas selecionadas após o retorno de um cancelamento caso o novo plano tenha limite menor.
 * @param request Request.
 * @param reply Reply.
 * @returns { success: boolean } - Retorna true se a reativação for concluída com sucesso.
 * @throws { ResourceNotFoundError } - Se a assinatura não for encontrada ou os dados da assinatura não estiverem completos.
 * @throws { Error } - Se o usuário ultrapassou o limite de empresas e nenhuma empresa foi fornecida para reativação, ou se ocorreu outro erro de lógica.
 * @throws { Error } - Para qualquer outro erro inesperado.
 */
export async function reactivateAssets(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // id do usuario (request.user.sub)
  const { companyIds } = reactivateAssetsBodySchema.parse(request.body)

  try {
    const reactivateAssetsUseCase = makeReactivateAssetsUseCase()

    const ip = request.ip
    const userAgent = request.headers['user-agent'] || 'Desconhecido'

    await reactivateAssetsUseCase.execute({
      userId: request.user.sub,
      companyIds,
      ip,
      userAgent,
    })

    // 200 OK - Reativação concluída com sucesso. Se o usuário ultrapassou o limite de empresas, ele receberá um aviso para configurar a reativação (gerenciamento manual)
    return reply.status(200).send({ success: true })
  } catch (err) {
    // 400 Bad Request - Se o usuário ultrapassou o limite de empresas e nenhuma empresa foi fornecida para reativação, ou se ocorreu outro erro de lógica
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }
    // 404 Not Found - Se a assinatura não for encontrada ou os dados da assinatura não estiverem completos
    if (err instanceof Error) {
      return reply.status(400).send({ message: err.message })
    }
    // 500 Internal Server Error - Para qualquer outro erro inesperado
    throw err
  }
}
