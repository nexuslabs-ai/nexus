<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  ProgressIndicator,
  ProgressRoot,
  type ProgressRootEmits,
  type ProgressRootProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ProgressProps extends ProgressRootProps {
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ProgressProps>(), {
  getValueText: (value: number | null | undefined, max: number) =>
    typeof value === 'number'
      ? `${Math.round((value / max) * 100)}%`
      : undefined,
});
const emits = defineEmits<ProgressRootEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <ProgressRoot
    v-bind="forwarded"
    data-slot="progress"
    :class="
      cn(
        'nx:relative nx:h-2 nx:w-full nx:overflow-hidden nx:rounded-full nx:bg-control-background',
        props.class
      )
    "
  >
    <ProgressIndicator
      data-slot="progress-indicator"
      class="nx:h-full nx:w-full nx:bg-primary-background nx:transition-transform nx:duration-fast nx:data-[state=indeterminate]:w-1/3 nx:data-[state=indeterminate]:animate-progress-indeterminate"
      :style="
        modelValue == null
          ? undefined
          : { transform: `translateX(-${100 - modelValue}%)` }
      "
    />
  </ProgressRoot>
</template>
