<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface FieldLegendProps {
  /**
   * Caption size. `legend` is larger, and `label` matches a field label.
   */
  variant?: 'legend' | 'label';
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<FieldLegendProps>(), {
  variant: 'legend',
});
</script>

<template>
  <legend
    data-slot="field-legend"
    :data-variant="variant"
    :class="
      cn(
        'nx:mb-3 nx:p-0 nx:data-[variant=legend]:typography-heading-xsmall nx:data-[variant=label]:typography-label-default',
        props.class
      )
    "
  >
    <slot />
  </legend>
</template>
