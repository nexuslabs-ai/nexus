<script setup lang="ts">
import { useVModel } from '@vueuse/core';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type TextareaVariants, textareaVariants } from '.';

export interface TextareaProps {
  variant?: TextareaVariants['variant'];
  /** The value, for `v-model`. */
  modelValue?: string;
  /** The starting value when `v-model` isn't bound. */
  defaultValue?: string;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<TextareaProps>(), {
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
  <textarea
    :value="model"
    data-slot="textarea"
    :data-variant="variant"
    :class="cn(textareaVariants({ variant }), props.class)"
    @input="model = ($event.target as HTMLTextAreaElement).value"
  />
</template>
