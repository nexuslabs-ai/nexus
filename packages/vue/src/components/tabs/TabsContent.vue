<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  TabsContent,
  type TabsContentProps as RekaTabsContentProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface TabsContentProps extends RekaTabsContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<TabsContentProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <TabsContent
    v-bind="forwarded"
    data-slot="tabs-content"
    :class="
      cn(
        'nx:mt-2 nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        props.class
      )
    "
  >
    <slot />
  </TabsContent>
</template>
