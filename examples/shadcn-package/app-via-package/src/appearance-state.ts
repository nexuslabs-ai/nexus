import { DEFAULT_NEXUS_APPEARANCE, type NexusAppearanceState } from '@nexus_ds/core'

export const APPEARANCE_STORAGE_KEY = 'acme-nexus-appearance'

export const defaultAppearance = { ...DEFAULT_NEXUS_APPEARANCE } satisfies NexusAppearanceState
