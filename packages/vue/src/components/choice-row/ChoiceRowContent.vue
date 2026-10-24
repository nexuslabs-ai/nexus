<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ChoiceRowContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ChoiceRowContentProps>();
</script>

<template>
  <div
    data-slot="choice-row-content"
    :class="
      cn('nx:flex nx:min-w-0 nx:flex-1 nx:flex-col nx:gap-0.5', props.class)
    "
  >
    <slot />
  </div>
</template>
