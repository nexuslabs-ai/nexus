<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface FieldSetProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<FieldSetProps>();
</script>

<template>
  <fieldset
    data-slot="field-set"
    :class="
      cn(
        'nx:m-0 nx:flex nx:min-w-0 nx:flex-col nx:gap-6 nx:border-0 nx:p-0 nx:has-[>[data-slot=checkbox-group]]:gap-3 nx:has-[>[data-slot=radio-group]]:gap-3',
        props.class
      )
    "
  >
    <slot />
  </fieldset>
</template>
