<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  Toggle,
  type ToggleEmits,
  type ToggleProps as RekaToggleProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type ToggleVariants, toggleVariants } from '.';

export interface ToggleProps extends RekaToggleProps {
  variant?: ToggleVariants['variant'];
  size?: ToggleVariants['size'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ToggleProps>(), {
  variant: 'default',
  size: 'default',
});
const emits = defineEmits<ToggleEmits>();

const delegated = reactiveOmit(props, 'class', 'variant', 'size');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <Toggle
    v-bind="forwarded"
    data-slot="toggle"
    :data-variant="variant"
    :data-size="size"
    :class="cn(toggleVariants({ variant, size }), props.class)"
  >
    <slot />
  </Toggle>
</template>
