<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  injectToggleGroupRootContext,
  ToggleGroupItem,
  type ToggleGroupItemProps as RekaToggleGroupItemProps,
  useForwardProps,
} from 'reka-ui';
import { computed, type HTMLAttributes, inject } from 'vue';

import { cn } from '../../lib/utils';
import { type ToggleVariants, toggleVariants } from '../toggle';

import { ToggleGroupKey } from '.';

export interface ToggleGroupItemProps extends RekaToggleGroupItemProps {
  variant?: ToggleVariants['variant'];
  size?: ToggleVariants['size'];
  class?: HTMLAttributes['class'];
}

const props = defineProps<ToggleGroupItemProps>();

const group = inject(ToggleGroupKey, {
  variant: 'default',
  size: 'default',
  spacing: 0,
  orientation: 'horizontal',
});
const root = injectToggleGroupRootContext();

// Joined bordered items overlap by one stroke, so each pair shares a single
// edge. Whichever item stacks higher paints that edge: focus, then selected
// invalid, invalid, selected, hover; equal items fall back to DOM order, so
// the later one wins. Disabled items never climb, so they never claim an
// edge. The focus rung repeats its class to outrank the (0,4,0)
// selected-invalid rung by specificity rather than by emit order.
const joinedItem = {
  base: 'nx:relative nx:rounded-none nx:not-disabled:hover:z-10 nx:not-disabled:data-[state=on]:z-20 nx:not-disabled:aria-invalid:z-30 nx:not-disabled:aria-invalid:data-[state=on]:z-40 nx:[&&&&:focus-visible]:z-50',
  horizontal:
    'nx:first:rounded-s-md nx:last:rounded-e-md nx:[[data-slot=toggle-group-item]:not([data-variant=default])+&:not([data-variant=default])]:-ms-(--nx-borderwidth-default)',
  vertical:
    'nx:first:rounded-t-md nx:last:rounded-b-md nx:[[data-slot=toggle-group-item]:not([data-variant=default])+&:not([data-variant=default])]:-mt-(--nx-borderwidth-default)',
} as const;

const variant = computed(() => props.variant ?? group.variant ?? 'default');
const size = computed(() => props.size ?? group.size ?? 'default');
const orientation = computed(() => group.orientation ?? 'horizontal');

// A single-select group is a radio group, as Radix renders it: each item
// reports aria-checked instead of Reka's aria-pressed.
const selectionAttrs = computed(() => {
  if (!root.isSingle.value) return {};
  return {
    role: 'radio',
    'aria-checked': root.modelValue.value === props.value,
    'aria-pressed': undefined,
  };
});

const delegated = reactiveOmit(props, 'class', 'variant', 'size');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <ToggleGroupItem
    v-bind="{ ...forwarded, ...selectionAttrs }"
    :class="
      cn(
        toggleVariants({ variant, size }),
        'nx:min-w-0 nx:shrink-0',
        group.spacing === 0 && [joinedItem.base, joinedItem[orientation]],
        props.class
      )
    "
    data-slot="toggle-group-item"
    :data-variant="variant"
    :data-size="size"
    :data-spacing="group.spacing"
    :data-orientation="orientation"
  >
    <slot />
  </ToggleGroupItem>
</template>
