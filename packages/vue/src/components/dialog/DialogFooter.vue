<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface DialogFooterProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DialogFooterProps>();
</script>

<template>
  <div
    data-slot="dialog-footer"
    data-orientation="horizontal"
    :class="
      cn(
        'nx:flex nx:shrink-0 nx:flex-col-reverse nx:px-6 nx:sm:flex-row nx:sm:justify-end nx:sm:gap-2',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
