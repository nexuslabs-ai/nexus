<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface CardActionProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<CardActionProps>();
</script>

<template>
  <div
    data-slot="card-action"
    :class="
      cn(
        'nx:col-start-2 nx:row-start-1 nx:row-span-2 nx:flex nx:items-center nx:gap-2 nx:self-start nx:justify-self-end nx:pl-4',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
