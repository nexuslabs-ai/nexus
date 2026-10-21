<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface AlertDescriptionProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AlertDescriptionProps>();
</script>

<template>
  <div
    data-slot="alert-description"
    :class="
      cn(
        'nx:typography-body-default nx:group-data-[variant=default]/alert:text-muted-foreground',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
