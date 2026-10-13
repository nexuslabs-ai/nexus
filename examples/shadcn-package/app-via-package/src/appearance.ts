import { createNexusAppearance } from '@acme/ui/nexus'

import { APPEARANCE_STORAGE_KEY, defaultAppearance } from './appearance-state'

export { useNexusAppearance } from '@acme/ui/nexus'

export const { NexusAppearanceProvider } = createNexusAppearance({
  storageKey: APPEARANCE_STORAGE_KEY,
  defaultState: defaultAppearance,
})
