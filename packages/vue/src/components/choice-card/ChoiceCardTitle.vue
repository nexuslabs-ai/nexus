<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ChoiceCardTitleProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ChoiceCardTitleProps>();
</script>

<template>
  <div
    data-slot="choice-card-title"
    :class="
      cn(
        'nx:min-w-0 nx:break-words nx:typography-label-default nx:text-foreground',
        'nx:group-has-[>[data-slot=checkbox]:disabled]/choice-card:text-disabled-foreground',
        'nx:group-has-[>[data-slot=radio-group-item]:disabled]/choice-card:text-disabled-foreground',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
