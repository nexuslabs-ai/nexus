<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface CardContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<CardContentProps>();
</script>

<template>
  <div data-slot="card-content" :class="cn('nx:p-6 nx:pt-0', props.class)">
    <slot />
  </div>
</template>
