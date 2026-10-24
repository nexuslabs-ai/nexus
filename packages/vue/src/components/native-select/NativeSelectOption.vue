<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface NativeSelectOptionProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<NativeSelectOptionProps>();
</script>

<template>
  <option
    data-slot="native-select-option"
    :class="cn('nx:bg-[Canvas] nx:text-[CanvasText]', props.class)"
  >
    <slot />
  </option>
</template>
