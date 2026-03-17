export class CollaboratorAlreadyExistsError extends Error {
  constructor() {
    super('Usuário já é colaborador desta empresa')
  }
}
