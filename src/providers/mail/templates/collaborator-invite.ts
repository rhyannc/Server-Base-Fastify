interface CollaboratorInviteTemplateVariables {
  userName: string
  companyName: string
}

export function collaboratorInviteTemplate({ userName, companyName }: CollaboratorInviteTemplateVariables) {
  const url = `http://localhost:3000/login`

  return `
    <div style="font-family: sans-serif; color: #333;">
      <h2>Olá, ${userName}!</h2>
      <p>Você acaba de ser adicionado como colaborador na empresa <strong>${companyName}</strong> em nossa plataforma.</p>
      <a href="${url}" style="background-color: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: display: inline-block;">Acessar Plataforma</a>
    </div>
  `
}
