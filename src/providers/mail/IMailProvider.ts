export interface SendMailDTO {
  to: string;
  subject: string;
  body: string;
}

export interface IMailProvider {
  sendMail(data: SendMailDTO): Promise<void>;
}
