export class PlanLimitChangeManagerRachedError extends Error {
  constructor(metric: string) {
    super(`O limite do plano do NOVO MANAGER para ${metric} foi atingido. Considere fazer um upgrade.`)
  }
}
