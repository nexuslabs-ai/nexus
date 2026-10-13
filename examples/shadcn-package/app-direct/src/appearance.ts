import { APPEARANCE_STORAGE_KEY, defaultAppearance } from './appearance-state'
import { createNexusAppearance } from './components/nexus/components/appearance/provider'

export { useNexusAppearance } from './components/nexus/components/appearance/provider'

export const { NexusAppearanceProvider } = createNexusAppearance({
  storageKey: APPEARANCE_STORAGE_KEY,
  defaultState: defaultAppearance,
})
