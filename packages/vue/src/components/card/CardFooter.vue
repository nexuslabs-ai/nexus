<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface CardFooterProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<CardFooterProps>();
</script>

<template>
  <div
    data-slot="card-footer"
    :class="cn('nx:flex nx:items-center nx:gap-2 nx:p-6 nx:pt-0', props.class)"
  >
    <slot />
  </div>
</template>
