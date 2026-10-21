<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface AlertContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AlertContentProps>();
</script>

<template>
  <div
    data-slot="alert-content"
    :class="cn('nx:flex nx:min-w-0 nx:flex-col', props.class)"
  >
    <slot />
  </div>
</template>
