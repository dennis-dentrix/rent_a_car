import { copy } from '@/copy/en'

// What a new company does first, in order, and how the overview shows each is done.
const STEPS = [
  ['company', (overview) => overview.company.is_complete],
  ['vehicle', (overview) => overview.vehicles_total > 0],
  ['price', (overview) => overview.vehicles_total > 0 && overview.vehicles_without_rate === 0],
  ['service', (overview) => overview.services > 0],
]

export const setupSteps = (overview) =>
  STEPS.map(([key, isDone]) => ({
    ...copy.operatorConsole.today.steps[key],
    key,
    isDone: isDone(overview),
  }))
