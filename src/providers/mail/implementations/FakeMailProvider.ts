import { IMailProvider, SendMailDTO } from '../IMailProvider'

export class FakeMailProvider implements IMailProvider {
  public emails: SendMailDTO[] = []

  async sendMail(data: SendMailDTO): Promise<void> {
    this.emails.push(data)
  }
}
