<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface AlertActionsProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AlertActionsProps>();
</script>

<template>
  <div
    data-slot="alert-actions"
    :class="
      cn(
        [
          'nx:mt-3 nx:flex nx:flex-wrap nx:items-center nx:gap-2',
          'nx:group-data-[layout=inline]/alert:mt-0 nx:group-data-[layout=inline]/alert:self-center',
        ],
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
