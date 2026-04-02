interface VerifyEmailTemplateVariables {
  name: string
  token: string
  isResend?: boolean
}

export function verifyEmailTemplate({ name, token, isResend = false }: VerifyEmailTemplateVariables) {
  const url = `http://localhost:3000/verify-email?token=${token}`
  
  const greeting = isResend ? `Olá novamente, ${name}!` : `Olá, ${name}!`
  const message = isResend 
    ? `Você solicitou um novo link para verificar seu e-mail e ativar a conta.`
    : `Para ativar sua conta, por favor, clique no botão abaixo:`

  return `
    <div style="font-family: sans-serif; color: #333;">
      <h2>${greeting}</h2>
      <p>${message}</p>
      <a href="${url}" style="background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verificar E-mail</a>
      <p>Este link expira em 24 horas.</p>
    </div>
  `
}
