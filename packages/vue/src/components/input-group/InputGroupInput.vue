<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { useForwardPropsEmits } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { Input, type InputVariants } from '../input';

export interface InputGroupInputProps {
  size?: InputVariants['size'];
  /** The value, for `v-model`. */
  modelValue?: string | number;
  /** The starting value when `v-model` isn't bound. */
  defaultValue?: string | number;
  class?: HTMLAttributes['class'];
}

const props = defineProps<InputGroupInputProps>();
const emits = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <Input
    v-bind="forwarded"
    data-slot="input-group-control"
    :class="
      cn(
        'nx:flex-1 nx:rounded-none nx:border-0 nx:focus-visible:outline-none',
        'nx:bg-transparent nx:enabled:hover:bg-transparent nx:disabled:bg-transparent',
        'nx:autofill-bg-transparent nx:enabled:hover:autofill-bg-transparent nx:disabled:autofill-bg-transparent',
        props.class
      )
    "
  />
</template>
