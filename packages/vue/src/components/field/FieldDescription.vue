<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface FieldDescriptionProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<FieldDescriptionProps>();
</script>

<template>
  <p
    data-slot="field-description"
    :class="
      cn(
        'nx:m-0 nx:typography-body-default nx:text-muted-foreground nx:group-has-data-[orientation=horizontal]/field:text-balance',
        'nx:[&>a]:text-inherit nx:[&>a]:underline nx:[&>a]:underline-offset-4 nx:[&>a:hover]:text-primary-subtle-foreground',
        props.class
      )
    "
  >
    <slot />
  </p>
</template>
