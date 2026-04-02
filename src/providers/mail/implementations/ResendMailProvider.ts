import { Resend } from 'resend'
import { env } from '@/env'
import { IMailProvider, SendMailDTO } from '../IMailProvider'

export class ResendMailProvider implements IMailProvider {
  private resend: Resend

  constructor() {
    if (!env.RESEND_API_KEY) {
      throw new Error('As resend api key was not provide in the env variables.')
    }
    this.resend = new Resend(env.RESEND_API_KEY)
  }

  async sendMail({ to, subject, body }: SendMailDTO): Promise<void> {
    const { data, error } = await this.resend.emails.send({
      from: 'SaaS Platform <onboarding@resend.dev>', // Em produção, insira seu domínio verificado no Resend
      to,
      subject,
      html: body,
    })

    if (error) {
      console.error('Erro ao enviar e-mail via Resend:', error)
      return
    }

    console.log(`E-mail enviado via Resend. ID: ${data?.id}`)
  }
}
