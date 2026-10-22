<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface CardProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<CardProps>();
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'nx:overflow-hidden nx:rounded-xl nx:border-width-default nx:border-color-default nx:bg-container nx:text-container-foreground nx:shadow-sm',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
