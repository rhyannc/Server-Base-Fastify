import nodemailer, { Transporter } from 'nodemailer';
import { IMailProvider, SendMailDTO } from '../IMailProvider';

export class EtherealMailProvider implements IMailProvider {
  private client!: Transporter;

  constructor() {
    nodemailer.createTestAccount().then((account) => {
      const transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });
      this.client = transporter;
      console.log('Ethereal Mail provider loaded.');
    }).catch(err => console.error('Failed to create Ethereal test account', err));
  }

  async sendMail({ to, subject, body }: SendMailDTO): Promise<void> {
    if (!this.client) {
      console.warn('Mail client not initialized yet. Delaying send...');
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (this.client) break;
      }
      if (!this.client) throw new Error('Ethereal Mail client not initialized.');
    }

    const message = await this.client.sendMail({
      to,
      from: 'SaaS Platform <noreply@saas.com>',
      subject,
      html: body,
    });

    console.log(`Message sent: ${message.messageId}`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(message)}`);
  }
}
