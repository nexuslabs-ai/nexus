import { APPEARANCE_STORAGE_KEY, defaultAppearance } from './appearance-state'
import { createNxdsAppearance } from './components/nxds/components/appearance/provider'

export { useNxdsAppearance } from './components/nxds/components/appearance/provider'

export const { NxdsAppearanceProvider } = createNxdsAppearance({
  storageKey: APPEARANCE_STORAGE_KEY,
  defaultState: defaultAppearance,
})
