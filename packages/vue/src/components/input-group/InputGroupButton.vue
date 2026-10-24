<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes, VNode } from 'vue';

import { cn } from '../../lib/utils';
import { Button, type ButtonVariants } from '../button';

import { type InputGroupButtonVariants, inputGroupButtonVariants } from '.';

export interface InputGroupButtonProps extends PrimitiveProps {
  variant?: ButtonVariants['variant'];
  size?: InputGroupButtonVariants['size'];
  /** Disables the button and shows a spinner in place of its content. */
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<InputGroupButtonProps>(), {
  as: 'button',
  variant: 'ghost',
  size: 'xs',
  loading: false,
  type: 'button',
});

const slots = defineSlots<{
  default?: () => VNode[];
  'start-icon'?: () => VNode[];
  'end-icon'?: () => VNode[];
}>();
</script>

<template>
  <Button
    :as="as"
    :as-child="asChild"
    :variant="variant"
    :loading="loading"
    :disabled="disabled"
    :type="type"
    data-slot="input-group-button"
    :data-size="size"
    :class="cn(inputGroupButtonVariants({ size }), props.class)"
  >
    <template v-if="slots['start-icon']" #start-icon>
      <slot name="start-icon" />
    </template>
    <slot />
    <template v-if="slots['end-icon']" #end-icon>
      <slot name="end-icon" />
    </template>
  </Button>
</template>
