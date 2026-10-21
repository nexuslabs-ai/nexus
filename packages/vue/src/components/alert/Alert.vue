<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type AlertVariants, alertVariants } from '.';

export interface AlertProps {
  variant?: AlertVariants['variant'];
  presentation?: AlertVariants['presentation'];
  layout?: AlertVariants['layout'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<AlertProps>(), {
  variant: 'default',
  presentation: 'card',
  layout: 'stack',
});
</script>

<template>
  <div
    data-slot="alert"
    :data-variant="variant"
    :data-presentation="presentation"
    :data-layout="layout"
    :class="cn(alertVariants({ variant, presentation, layout }), props.class)"
  >
    <slot />
  </div>
</template>
