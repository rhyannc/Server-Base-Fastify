interface ForgotPasswordTemplateVariables {
  name: string
  token: string
}

export function forgotPasswordTemplate({ name, token }: ForgotPasswordTemplateVariables) {
  const url = `http://localhost:3000/reset-password?token=${token}`

  return `
    <div style="font-family: sans-serif; color: #333;">
      <h2>Olá, ${name}</h2>
      <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
      <p>Clique no link abaixo para criar uma nova senha:</p>
      <a href="${url}" style="background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Redefinir Senha</a>
      <p>Este link é válido por 2 horas. Se não foi você quem solicitou, ignore este e-mail.</p>
    </div>
  `
}
