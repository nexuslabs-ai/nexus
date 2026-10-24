<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface FieldGroupProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<FieldGroupProps>();
</script>

<template>
  <div
    data-slot="field-group"
    :class="
      cn(
        'nx:group/field-group nx:@container/field-group nx:flex nx:w-full nx:flex-col nx:gap-7 nx:data-[slot=checkbox-group]:gap-3 nx:*:data-[slot=field-group]:gap-4',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
