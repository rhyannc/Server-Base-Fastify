export class OnlyAdminAuthorizedError extends Error {
  constructor() {
    super('Apenas o Proprietario da empresa pode realizar esta ação.')
  }
}
