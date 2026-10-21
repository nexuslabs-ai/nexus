<script setup lang="ts">
import { IconX } from '@tabler/icons-vue';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface AlertCloseProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AlertCloseProps>();
</script>

<template>
  <button
    type="button"
    data-slot="alert-close"
    :class="
      cn(
        'nx:inline-flex nx:size-8 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-sm nx:border-0 nx:bg-transparent nx:p-0 nx:text-muted-foreground',
        'nx:transition-control nx:hover:bg-container-hover nx:hover:text-foreground',
        'nx:focus-visible:bg-container-hover nx:focus-visible:text-foreground',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        'nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground',
        'nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
        props.class
      )
    "
  >
    <slot>
      <IconX aria-hidden="true" />
      <span class="nx:sr-only">Dismiss alert</span>
    </slot>
  </button>
</template>
