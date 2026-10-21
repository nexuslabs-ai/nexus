<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  TabsTrigger,
  type TabsTriggerProps as RekaTabsTriggerProps,
  useForwardProps,
} from 'reka-ui';
import { type HTMLAttributes, inject } from 'vue';

import { cn } from '../../lib/utils';

import { TabsListKey, tabsTriggerVariants } from '.';

export interface TabsTriggerProps extends RekaTabsTriggerProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<TabsTriggerProps>();

const list = inject(TabsListKey, {
  variant: 'default',
  size: 'default',
} as const);
const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <TabsTrigger
    v-bind="forwarded"
    data-slot="tabs-trigger"
    :data-variant="list.variant"
    :data-size="list.size"
    :class="
      cn(
        tabsTriggerVariants({ variant: list.variant, size: list.size }),
        props.class
      )
    "
  >
    <slot />
  </TabsTrigger>
</template>
