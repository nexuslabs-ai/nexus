<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface AlertIconProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AlertIconProps>();
</script>

<template>
  <span
    data-slot="alert-icon"
    aria-hidden="true"
    :class="
      cn(
        [
          'nx:flex nx:[&>svg]:size-4',
          'nx:group-data-[layout=stack]/alert:translate-y-0.5',
        ],
        props.class
      )
    "
  >
    <slot />
  </span>
</template>
