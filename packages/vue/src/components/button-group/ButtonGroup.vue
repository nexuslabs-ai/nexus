<script setup lang="ts">
import { type HTMLAttributes, provide } from 'vue';

import { cn } from '../../lib/utils';
import { ButtonGroupKey, type ButtonGroupSize } from '../button';

import { type ButtonGroupVariants, buttonGroupVariants } from '.';

export interface ButtonGroupProps {
  orientation?: ButtonGroupVariants['orientation'];
  /**
   * Size for ButtonGroupText and any Button without its own `size`. It also reaches a Button inside a trigger wrapper, as in a split button.
   */
  size?: ButtonGroupSize;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ButtonGroupProps>(), {
  orientation: 'horizontal',
  size: 'default',
});

provide(ButtonGroupKey, props);
</script>

<template>
  <div
    role="group"
    data-slot="button-group"
    :data-orientation="orientation"
    :data-size="size"
    :class="cn(buttonGroupVariants({ orientation }), props.class)"
  >
    <slot />
  </div>
</template>
