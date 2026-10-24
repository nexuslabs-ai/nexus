<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface FieldTitleProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<FieldTitleProps>();
</script>

<template>
  <div
    data-slot="field-label"
    :class="
      cn(
        'nx:flex nx:w-fit nx:items-center nx:gap-2 nx:typography-label-default nx:group-data-[disabled=true]/field:text-disabled-foreground',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
