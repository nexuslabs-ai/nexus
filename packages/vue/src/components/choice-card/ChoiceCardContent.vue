<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ChoiceCardContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ChoiceCardContentProps>();
</script>

<template>
  <div
    data-slot="choice-card-content"
    :class="
      cn('nx:flex nx:min-w-0 nx:flex-1 nx:flex-col nx:gap-0.5', props.class)
    "
  >
    <slot />
  </div>
</template>
