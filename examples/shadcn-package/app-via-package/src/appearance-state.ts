import { DEFAULT_NXDS_APPEARANCE, type NxdsAppearanceState } from '@nxds/core'

export const APPEARANCE_STORAGE_KEY = 'acme-nxds-appearance'

export const defaultAppearance = { ...DEFAULT_NXDS_APPEARANCE } satisfies NxdsAppearanceState
