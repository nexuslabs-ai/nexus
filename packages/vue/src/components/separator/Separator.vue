<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { Separator, type SeparatorProps as RekaSeparatorProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SeparatorProps extends RekaSeparatorProps {
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<SeparatorProps>(), {
  orientation: 'horizontal',
  decorative: true,
});

const delegated = reactiveOmit(props, 'class');
</script>

<template>
  <Separator
    v-bind="delegated"
    data-slot="separator"
    :class="
      cn(
        'nx:shrink-0 nx:bg-border-default',
        'nx:data-[orientation=horizontal]:h-px nx:data-[orientation=horizontal]:w-full',
        'nx:data-[orientation=vertical]:h-full nx:data-[orientation=vertical]:w-px',
        props.class
      )
    "
  />
</template>
