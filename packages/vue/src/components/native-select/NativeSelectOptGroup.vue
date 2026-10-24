<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface NativeSelectOptGroupProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<NativeSelectOptGroupProps>();
</script>

<template>
  <optgroup
    data-slot="native-select-optgroup"
    :class="cn('nx:bg-[Canvas] nx:text-[CanvasText]', props.class)"
  >
    <slot />
  </optgroup>
</template>
