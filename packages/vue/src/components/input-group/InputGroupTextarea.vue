<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { useForwardPropsEmits } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { Textarea } from '../textarea';

export interface InputGroupTextareaProps {
  /** The value, for `v-model`. */
  modelValue?: string;
  /** The starting value when `v-model` isn't bound. */
  defaultValue?: string;
  class?: HTMLAttributes['class'];
}

const props = defineProps<InputGroupTextareaProps>();
const emits = defineEmits<{
  'update:modelValue': [value: string];
}>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <Textarea
    v-bind="forwarded"
    data-slot="input-group-control"
    :class="
      cn(
        'nx:flex-1 nx:resize-none nx:rounded-none nx:border-0 nx:py-3 nx:focus-visible:outline-none',
        'nx:bg-transparent nx:enabled:hover:bg-transparent nx:disabled:bg-transparent',
        'nx:autofill-bg-transparent nx:enabled:hover:autofill-bg-transparent nx:disabled:autofill-bg-transparent',
        props.class
      )
    "
  />
</template>
