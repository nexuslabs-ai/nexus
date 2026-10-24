<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import type { SeparatorProps as RekaSeparatorProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { Separator } from '../separator';

export interface ButtonGroupSeparatorProps extends RekaSeparatorProps {
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ButtonGroupSeparatorProps>(), {
  orientation: 'vertical',
  decorative: true,
});

const delegated = reactiveOmit(props, 'class');
</script>

<template>
  <Separator
    v-bind="delegated"
    data-slot="button-group-separator"
    :class="
      cn(
        'nx:relative nx:self-stretch nx:data-[orientation=vertical]:h-auto',
        props.class
      )
    "
  />
</template>
