import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'

import { makeUpdateCompaniesUseCase } from '@/use-cases/factories/make-update-companies'

export const updateCompanyBodySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  cnpj: z
    .string()
    .regex(/^\d+$/, 'Deve conter apenas números')
    .min(14, 'Precisa ter minimo 14 caracteres'),
  email: z.string().email(),
  phone: z.string(),
  country: z.string().optional().describe('País (opcional, padrão BR)'),
  city: z.string(),
  state: z.string(),
  address: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  cep: z.string().regex(/^\d+$/, 'Deve conter apenas números').optional(),
})
export const updateCompanyBodyResponse = {
  201: z
    .object({ companyId: z.uuid() })
    .describe('Company atualizada com sucesso!'),
  409: z.object({ message: z.string() }).describe('Company já existente'),
}

// Função assíncrona que lida com a requisição de atualização de uma Company
export async function updateCompany(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const {
    id,
    name,
    cnpj,
    email,
    phone,
    country,
    city,
    state,
    address,
    number,
    complement,
    cep,
  } = updateCompanyBodySchema.parse(request.body)

  const updateCompanyUseCase = makeUpdateCompaniesUseCase()

  const { company } = await updateCompanyUseCase.execute({
    id,
    name,
    cnpj,
    email,
    phone,
    country,
    city,
    state,
    address,
    number,
    complement,
    cep,
  })

  return reply.status(201).send({ companyId: company.id }) //  retorna o ID
}
