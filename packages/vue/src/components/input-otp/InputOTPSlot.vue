<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  PinInputInput,
  type PinInputInputProps,
  useForwardProps,
} from 'reka-ui';
import { type HTMLAttributes, inject, ref } from 'vue';

import { cn } from '../../lib/utils';

import { InputOTPKey } from '.';

export interface InputOTPSlotProps extends Omit<PinInputInputProps, 'index'> {
  /**
   * Position of the slot in the code, starting at 0.
   */
  index: number;
  class?: HTMLAttributes['class'];
}

const props = defineProps<InputOTPSlotProps>();

const otpAttrs = inject(InputOTPKey, {});
const active = ref(false);

function nameAttrs() {
  const label = otpAttrs['aria-label'];
  const shared = {
    'aria-labelledby': otpAttrs['aria-labelledby'],
    'aria-invalid': otpAttrs['aria-invalid'],
  };
  if (typeof label !== 'string') return shared;
  return { ...shared, 'aria-label': `${label}, character ${props.index + 1}` };
}

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <PinInputInput
    v-bind="{ ...forwarded, ...nameAttrs() }"
    data-slot="input-otp-slot"
    :data-active="active"
    :class="
      cn(
        'nx:relative nx:flex nx:box-border nx:size-10 nx:items-center nx:justify-center',
        'nx:border-default nx:border-border-default nx:not-first:-ml-(--nx-borderwidth-default)',
        'nx:group-has-[:disabled]/input-otp:border-border-disabled nx:group-has-[:disabled]/input-otp:bg-disabled nx:group-has-[:disabled]/input-otp:text-disabled-foreground',
        'nx:bg-container nx:text-foreground nx:typography-body-small nx:transition-field nx:duration-fast',
        'nx:first:rounded-l-md nx:last:rounded-r-md',
        'nx:data-[active=true]:z-1 nx:data-[active=true]:border-focus-default nx:data-[active=true]:outline-default nx:data-[active=true]:outline-focus-default',
        'nx:m-0 nx:p-0 nx:text-center nx:disabled:cursor-not-allowed',
        props.class
      )
    "
    @focus="active = true"
    @blur="active = false"
  />
</template>
