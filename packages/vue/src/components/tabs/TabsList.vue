<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  injectTabsRootContext,
  TabsIndicator,
  TabsList,
  type TabsListProps as RekaTabsListProps,
  useForwardProps,
} from 'reka-ui';
import { computed, type HTMLAttributes, provide } from 'vue';

import { cn } from '../../lib/utils';

import { TabsListKey } from '.';

export interface TabsListProps extends RekaTabsListProps {
  /** Visual style of every trigger in the list. */
  variant?: 'default' | 'underline';
  /** Size of every trigger in the list. */
  size?: 'sm' | 'default' | 'lg';
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<TabsListProps>(), {
  variant: 'default',
  size: 'default',
});

provide(TabsListKey, props);

const delegated = reactiveOmit(props, 'class', 'variant', 'size');
const forwarded = useForwardProps(delegated);

const { orientation } = injectTabsRootContext();
const isVertical = computed(() => orientation.value === 'vertical');
</script>

<template>
  <TabsList
    v-bind="forwarded"
    data-slot="tabs-list"
    :data-variant="variant"
    :data-size="size"
    :class="
      cn(
        'nx:relative nx:isolate nx:inline-flex nx:items-center nx:justify-center',
        'nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:items-stretch',
        variant === 'default' &&
          'nx:rounded-md nx:bg-control-background nx:p-1',
        props.class
      )
    "
  >
    <TabsIndicator
      aria-hidden="true"
      data-slot="tabs-indicator"
      :data-variant="variant"
      :class="
        cn(
          'nx:pointer-events-none nx:absolute nx:z-0',
          'nx:transition-[translate,width,height] nx:duration-fast nx:ease-move',
          isVertical
            ? 'nx:top-0 nx:h-(--reka-tabs-indicator-size) nx:translate-y-(--reka-tabs-indicator-position)'
            : 'nx:left-0 nx:w-(--reka-tabs-indicator-size) nx:translate-x-(--reka-tabs-indicator-position)',
          variant === 'default' && [
            'nx:rounded-sm nx:border-default nx:border-border-default nx:bg-background',
            isVertical ? 'nx:inset-x-1' : 'nx:inset-y-1',
          ],
          variant === 'underline' && [
            'nx:bg-primary-background',
            isVertical
              ? 'nx:right-0 nx:w-(--nx-borderwidth-thick)'
              : 'nx:bottom-0 nx:h-(--nx-borderwidth-thick)',
          ]
        )
      "
    />
    <slot />
  </TabsList>
</template>
