<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ChoiceRowDescriptionProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ChoiceRowDescriptionProps>();
</script>

<template>
  <p
    data-slot="choice-row-description"
    :class="
      cn(
        'nx:m-0 nx:typography-body-default nx:text-muted-foreground nx:group-has-[:disabled]/choice-row:text-disabled-foreground',
        props.class
      )
    "
  >
    <slot />
  </p>
</template>
