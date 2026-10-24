<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type FieldVariants, fieldVariants } from '.';

export interface FieldProps {
  orientation?: FieldVariants['orientation'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<FieldProps>(), {
  orientation: 'vertical',
});
</script>

<template>
  <div
    role="group"
    data-slot="field"
    :data-orientation="orientation"
    :class="cn(fieldVariants({ orientation }), props.class)"
  >
    <slot />
  </div>
</template>
