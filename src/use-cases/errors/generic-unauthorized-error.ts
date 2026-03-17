export class GenericUnauthorizedError extends Error {
  constructor() {
    super('Apenas administradores ou o gerente da empresa podem realizar esta ação.')
  }
}
