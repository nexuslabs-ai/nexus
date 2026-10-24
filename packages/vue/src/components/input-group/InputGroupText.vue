<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface InputGroupTextProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<InputGroupTextProps>();
</script>

<template>
  <span
    data-slot="input-group-text"
    :class="
      cn(
        'nx:flex nx:items-center nx:gap-2 nx:typography-body-default nx:text-muted-foreground nx:group-data-[disabled=true]/input-group:text-disabled-foreground nx:[&_svg]:pointer-events-none nx:[&_svg]:size-4',
        props.class
      )
    "
  >
    <slot />
  </span>
</template>
