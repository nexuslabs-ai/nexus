<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { overlayHeaderVariants } from '../overlay-layout/overlay-layout';

export interface DialogHeaderProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DialogHeaderProps>();
</script>

<template>
  <div
    data-slot="dialog-header"
    data-variant="default"
    :class="cn(overlayHeaderVariants({ variant: 'default' }), props.class)"
  >
    <slot />
  </div>
</template>
