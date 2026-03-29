export class GenericUnauthorizedError extends Error {
  constructor() {
    super('Apenas Gerente ou o LEAD da empresa podem realizar esta ação.')
  }
}
