<script setup lang="ts">
import { IconChevronDown } from '@tabler/icons-vue';
import { useVModel } from '@vueuse/core';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type NativeSelectVariants, nativeSelectVariants } from '.';

export interface NativeSelectProps {
  size?: NativeSelectVariants['size'];
  variant?: NativeSelectVariants['variant'];
  /** The selected value, for `v-model`. */
  modelValue?: string;
  /** The starting value when `v-model` isn't bound. */
  defaultValue?: string;
  class?: HTMLAttributes['class'];
}

// Attributes belong on the `<select>`, not the wrapper around it.
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<NativeSelectProps>(), {
  size: 'default',
  variant: 'bordered',
});
const emits = defineEmits<{
  'update:modelValue': [value: string];
}>();

const model = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
});
</script>

<template>
  <div
    data-slot="native-select-wrapper"
    class="nx:group/native-select nx:relative nx:w-full"
  >
    <select
      v-bind="$attrs"
      v-model="model"
      data-slot="native-select"
      :data-size="size"
      :data-variant="variant"
      :class="cn(nativeSelectVariants({ size, variant }), props.class)"
    >
      <slot />
    </select>
    <IconChevronDown
      aria-hidden="true"
      data-slot="native-select-icon"
      class="nx:pointer-events-none nx:absolute nx:top-1/2 nx:right-3.5 nx:size-4 nx:-translate-y-1/2 nx:text-muted-foreground nx:select-none nx:group-has-[select:disabled]/native-select:text-disabled-foreground"
    />
  </div>
</template>
