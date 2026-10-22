<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface CardDescriptionProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<CardDescriptionProps>();
</script>

<template>
  <p
    data-slot="card-description"
    :class="
      cn(
        'nx:col-start-1 nx:m-0 nx:min-w-0 nx:typography-body-default nx:text-muted-foreground',
        props.class
      )
    "
  >
    <slot />
  </p>
</template>
