<script setup lang="ts">
import { IconCheck, IconMinus } from '@tabler/icons-vue';
import { reactiveOmit } from '@vueuse/core';
import {
  CheckboxIndicator,
  CheckboxRoot,
  type CheckboxRootEmits,
  type CheckboxRootProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { selectionIndicatorMotionClassName } from '../../lib/motion';
import { cn } from '../../lib/utils';

export interface CheckboxProps extends CheckboxRootProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<CheckboxProps>();
const emits = defineEmits<CheckboxRootEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <CheckboxRoot
    v-bind="forwarded"
    data-slot="checkbox"
    :class="
      cn(
        'nx:group nx:peer nx:inline-flex nx:size-4 nx:shrink-0 nx:items-center nx:justify-center nx:p-0',
        'nx:rounded-sm nx:border-default nx:border-border-default nx:bg-container',
        'nx:transition-control',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        'nx:aria-invalid:border-error-border nx:aria-invalid:focus-visible:outline-focus-error',
        'nx:disabled:cursor-not-allowed nx:disabled:border-border-disabled nx:disabled:bg-disabled',
        'nx:enabled:data-[state=unchecked]:hover:bg-container-hover nx:enabled:data-[state=unchecked]:active:bg-container-active',
        'nx:data-[state=checked]:border-primary-background nx:data-[state=checked]:bg-primary-background nx:data-[state=checked]:text-primary-foreground',
        'nx:enabled:data-[state=checked]:hover:border-primary-background-hover nx:enabled:data-[state=checked]:hover:bg-primary-background-hover',
        'nx:enabled:data-[state=checked]:active:border-primary-background-hover nx:enabled:data-[state=checked]:active:bg-primary-background-active',
        'nx:data-[state=indeterminate]:border-primary-background nx:data-[state=indeterminate]:bg-primary-background nx:data-[state=indeterminate]:text-primary-foreground',
        'nx:enabled:data-[state=indeterminate]:hover:border-primary-background-hover nx:enabled:data-[state=indeterminate]:hover:bg-primary-background-hover',
        'nx:enabled:data-[state=indeterminate]:active:border-primary-background-hover nx:enabled:data-[state=indeterminate]:active:bg-primary-background-active',
        'nx:data-[state=checked]:disabled:border-primary-disabled nx:data-[state=checked]:disabled:bg-primary-disabled',
        'nx:data-[state=indeterminate]:disabled:border-primary-disabled nx:data-[state=indeterminate]:disabled:bg-primary-disabled',
        'nx:aria-invalid:data-[state=checked]:border-error-border nx:aria-invalid:data-[state=checked]:bg-error-background nx:aria-invalid:data-[state=checked]:text-error-foreground',
        'nx:aria-invalid:data-[state=indeterminate]:border-error-border nx:aria-invalid:data-[state=indeterminate]:bg-error-background nx:aria-invalid:data-[state=indeterminate]:text-error-foreground',
        'nx:enabled:aria-invalid:data-[state=checked]:hover:border-error-border nx:enabled:aria-invalid:data-[state=checked]:hover:bg-error-background-hover',
        'nx:enabled:aria-invalid:data-[state=checked]:active:border-error-border nx:enabled:aria-invalid:data-[state=checked]:active:bg-error-background-active',
        'nx:enabled:aria-invalid:data-[state=indeterminate]:hover:border-error-border nx:enabled:aria-invalid:data-[state=indeterminate]:hover:bg-error-background-hover',
        'nx:enabled:aria-invalid:data-[state=indeterminate]:active:border-error-border nx:enabled:aria-invalid:data-[state=indeterminate]:active:bg-error-background-active',
        props.class
      )
    "
  >
    <CheckboxIndicator
      force-mount
      data-slot="checkbox-indicator"
      class="nx:relative nx:flex nx:size-full nx:items-center nx:justify-center nx:text-current"
    >
      <IconCheck
        data-slot="checkbox-check"
        aria-hidden="true"
        :class="
          cn(
            'nx:absolute nx:size-3.5',
            selectionIndicatorMotionClassName,
            'nx:group-data-[state=checked]:scale-100 nx:group-data-[state=checked]:opacity-100'
          )
        "
      />
      <IconMinus
        data-slot="checkbox-minus"
        aria-hidden="true"
        :class="
          cn(
            'nx:absolute nx:size-3.5',
            selectionIndicatorMotionClassName,
            'nx:group-data-[state=indeterminate]:scale-100 nx:group-data-[state=indeterminate]:opacity-100'
          )
        "
      />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
