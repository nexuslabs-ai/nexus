<script setup lang="ts">
import { useVModel } from '@vueuse/core';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type InputVariants, inputVariants } from '.';

export interface InputProps {
  size?: InputVariants['size'];
  variant?: InputVariants['variant'];
  /** The value, for `v-model`. */
  modelValue?: string | number;
  /** The starting value when `v-model` isn't bound. */
  defaultValue?: string | number;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<InputProps>(), {
  size: 'default',
  variant: 'bordered',
});
const emits = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const model = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
});
</script>

<template>
  <input
    v-model="model"
    data-slot="input"
    :data-size="size"
    :data-variant="variant"
    :class="cn(inputVariants({ size, variant }), props.class)"
  />
</template>
