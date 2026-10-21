import { createNxdsAppearance } from '@acme/ui/nxds'

import { APPEARANCE_STORAGE_KEY, defaultAppearance } from './appearance-state'

export { useNxdsAppearance } from '@acme/ui/nxds'

export const { NxdsAppearanceProvider } = createNxdsAppearance({
  storageKey: APPEARANCE_STORAGE_KEY,
  defaultState: defaultAppearance,
})
