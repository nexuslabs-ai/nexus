<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui';
import { Comment, computed, type HTMLAttributes, Text, type VNode } from 'vue';

import { cn } from '../../lib/utils';
import Spinner from '../spinner/Spinner.vue';

import { type ButtonVariants, buttonVariants } from '.';

export interface ButtonProps extends PrimitiveProps {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  /** Disables the button and shows a spinner in place of its content. */
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ButtonProps>(), {
  as: 'button',
  variant: 'default',
  size: 'default',
  loading: false,
  type: 'button',
});

const slots = defineSlots<{
  default?: () => VNode[];
  'start-icon'?: () => VNode[];
  'end-icon'?: () => VNode[];
}>();

function isIconButtonSize(size: ButtonVariants['size']) {
  return size === 'icon-sm' || size === 'icon' || size === 'icon-lg';
}

const isDisabled = computed(() => props.disabled || props.loading);
const iconOnly = computed(() => isIconButtonSize(props.size));
// `asChild` clones onto a single child element; any other child keeps the
// native `<button>`, as React's Slot does.
function rendersAsChild() {
  if (!props.asChild) return false;
  const nodes = (slots.default?.() ?? []).filter(
    (node) =>
      node.type !== Comment &&
      !(node.type === Text && !String(node.children).trim())
  );
  return nodes.length === 1 && typeof nodes[0]?.type !== 'symbol';
}

// `type` and `disabled` mean nothing on another tag, which also stays focusable.
const isNativeButton = () => !rendersAsChild() && props.as === 'button';
</script>

<template>
  <Primitive
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :data-icon-only="iconOnly || undefined"
    :data-loading="loading || undefined"
    :as="as"
    :as-child="rendersAsChild()"
    :class="cn(buttonVariants({ variant, size }), props.class)"
    :type="isNativeButton() ? type : undefined"
    :disabled="isNativeButton() ? isDisabled : undefined"
    :tabindex="!isNativeButton() && isDisabled ? -1 : undefined"
    :aria-busy="loading || undefined"
    :aria-disabled="isDisabled || undefined"
  >
    <slot v-if="rendersAsChild()" />
    <span
      v-else-if="loading"
      data-slot="button-loading-content"
      class="nx:relative nx:inline-flex nx:items-center nx:justify-center"
    >
      <span data-slot="button-loading-label" class="nx:opacity-0"
        ><slot
      /></span>
      <Spinner
        aria-hidden="true"
        class="nx:absolute nx:left-1/2 nx:top-1/2 nx:-translate-x-1/2 nx:-translate-y-1/2"
      />
    </span>
    <template v-else>
      <span
        v-if="slots['start-icon']"
        aria-hidden="true"
        data-slot="button-start-icon"
        class="nx:inline-flex nx:shrink-0"
      >
        <slot name="start-icon" />
      </span>
      <slot />
      <span
        v-if="slots['end-icon']"
        aria-hidden="true"
        data-slot="button-end-icon"
        class="nx:inline-flex nx:shrink-0"
      >
        <slot name="end-icon" />
      </span>
    </template>
  </Primitive>
</template>
