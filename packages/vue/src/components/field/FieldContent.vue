<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface FieldContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<FieldContentProps>();
</script>

<template>
  <div
    data-slot="field-content"
    :class="
      cn(
        'nx:group/field-content nx:flex nx:flex-1 nx:flex-col nx:gap-1.5',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
