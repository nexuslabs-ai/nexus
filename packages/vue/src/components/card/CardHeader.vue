<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface CardHeaderProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<CardHeaderProps>();
</script>

<template>
  <div
    data-slot="card-header"
    :class="
      cn(
        'nx:grid nx:grid-cols-[minmax(0,1fr)_auto] nx:items-start nx:gap-y-1.5 nx:p-6',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
