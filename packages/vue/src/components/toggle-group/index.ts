import type { InjectionKey } from 'vue';

import type { ToggleGroupProps } from './ToggleGroup.vue';

export {
  default as ToggleGroup,
  type ToggleGroupProps,
} from './ToggleGroup.vue';
export {
  default as ToggleGroupItem,
  type ToggleGroupItemProps,
} from './ToggleGroupItem.vue';

export const ToggleGroupKey: InjectionKey<
  Required<
    Pick<ToggleGroupProps, 'variant' | 'size' | 'spacing' | 'orientation'>
  >
> = Symbol('toggle-group');
