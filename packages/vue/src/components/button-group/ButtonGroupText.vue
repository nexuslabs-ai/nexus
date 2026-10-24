<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui';
import { computed, type HTMLAttributes, inject } from 'vue';

import { cn } from '../../lib/utils';
import { ButtonGroupKey, type ButtonGroupSize } from '../button';

import { buttonGroupTextVariants } from '.';

export interface ButtonGroupTextProps extends PrimitiveProps {
  /**
   * Addon size. Inherits from ButtonGroup when omitted, or `"default"` outside one.
   */
  size?: ButtonGroupSize;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ButtonGroupTextProps>(), {
  as: 'div',
});

const group = inject(ButtonGroupKey, undefined);
const size = computed(() => props.size ?? group?.size ?? 'default');
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    data-slot="button-group-text"
    :data-size="size"
    :class="
      cn(
        buttonGroupTextVariants({ size }),
        asChild &&
          'nx:cursor-pointer nx:hover:bg-container-hover nx:active:bg-container-active',
        props.class
      )
    "
  >
    <slot />
  </Primitive>
</template>
