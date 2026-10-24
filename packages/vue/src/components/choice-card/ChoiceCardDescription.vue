<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ChoiceCardDescriptionProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ChoiceCardDescriptionProps>();
</script>

<template>
  <p
    data-slot="choice-card-description"
    :class="
      cn(
        'nx:m-0 nx:min-w-0 nx:break-words nx:typography-body-default nx:text-muted-foreground',
        'nx:group-has-[>[data-slot=checkbox]:disabled]/choice-card:text-disabled-foreground',
        'nx:group-has-[>[data-slot=radio-group-item]:disabled]/choice-card:text-disabled-foreground',
        props.class
      )
    "
  >
    <slot />
  </p>
</template>
