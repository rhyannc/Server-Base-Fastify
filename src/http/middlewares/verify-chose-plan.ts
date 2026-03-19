import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@/lib/prisma'

export async function verifyChosePlan(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sub } = request.user

  const user = await prisma.user.findUnique({
    where: { id: sub },
    select: { chosePlan: true },
  })

  if (!user || !user.chosePlan) {
    return reply.status(403).send({
      message: 'Acesso negado. Você precisa escolher um plano para acessar este recurso.',
    })
  }
}
