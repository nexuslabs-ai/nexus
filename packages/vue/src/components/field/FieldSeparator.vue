<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { Separator } from '../separator';

export interface FieldSeparatorProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<FieldSeparatorProps>();

const slots = defineSlots<{ default?: () => unknown }>();
</script>

<template>
  <div
    data-slot="field-separator"
    :data-content="!!slots.default"
    :class="
      cn('nx:relative nx:-my-2 nx:h-5 nx:typography-body-default', props.class)
    "
  >
    <Separator class="nx:absolute nx:inset-0 nx:top-1/2" />
    <span
      v-if="slots.default"
      data-slot="field-separator-content"
      class="nx:relative nx:mx-auto nx:block nx:w-fit nx:bg-container nx:px-2 nx:text-muted-foreground"
    >
      <slot />
    </span>
  </div>
</template>
