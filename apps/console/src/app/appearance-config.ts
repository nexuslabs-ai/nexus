import { createNexusAppearance } from '@nexus_ds/react/appearance';

import {
  CONSOLE_APPEARANCE_DEFAULT,
  CONSOLE_STORAGE_KEY,
} from './appearance-defaults';

export {
  CONSOLE_APPEARANCE_DEFAULT,
  CONSOLE_STORAGE_KEY,
} from './appearance-defaults';

export const CONSOLE_APPEARANCE = createNexusAppearance({
  storageKey: CONSOLE_STORAGE_KEY,
  defaultState: CONSOLE_APPEARANCE_DEFAULT,
});
