<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import type { LabelProps as RekaLabelProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { Label } from '../label';

export interface ChoiceRowProps extends RekaLabelProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ChoiceRowProps>();

const delegated = reactiveOmit(props, 'class');
</script>

<template>
  <Label
    v-bind="delegated"
    data-slot="choice-row"
    :class="
      cn(
        'nx:group/choice-row nx:box-border nx:flex nx:min-h-8 nx:min-w-0 nx:w-full nx:cursor-pointer nx:items-center nx:justify-start nx:gap-2 nx:rounded-sm nx:px-2 nx:py-1.5 nx:transition-colors',
        'nx:not-has-[:disabled]:hover:bg-background-hover nx:not-has-[:disabled]:active:bg-background-active',
        'nx:has-[:disabled]:cursor-not-allowed nx:has-[:disabled]:text-disabled-foreground',
        props.class
      )
    "
  >
    <slot />
  </Label>
</template>
