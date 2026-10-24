<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type InputGroupVariants, inputGroupVariants } from '.';

export interface InputGroupProps {
  variant?: InputGroupVariants['variant'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<InputGroupProps>(), {
  variant: 'bordered',
});
</script>

<template>
  <div
    data-slot="input-group"
    :data-variant="variant"
    role="group"
    :class="cn(inputGroupVariants({ variant }), props.class)"
  >
    <slot />
  </div>
</template>
