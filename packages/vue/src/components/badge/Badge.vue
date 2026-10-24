<script setup lang="ts">
import { Comment, Fragment, type HTMLAttributes, Text, type VNode } from 'vue';

import { cn } from '../../lib/utils';

import {
  badgeIconClasses,
  badgeShapeClasses,
  type BadgeVariants,
  badgeVariants,
} from '.';

export interface BadgeProps {
  variant?: BadgeVariants['variant'];
  fill?: BadgeVariants['fill'];
  /** Uppercase text with wider letter spacing. */
  isCaps?: boolean;
  /**
   * Renders a round count badge from its children and ignores icons.
   * Add an `aria-label` such as "8 unread", because a bare number lacks context.
   */
  isNumber?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: 'default',
  fill: 'solid',
  isCaps: true,
  isNumber: false,
});

const slots = defineSlots<{
  default?: () => VNode[];
  /** Icon before the label, sized to 14px. Without a label, it shows alone. */
  'left-icon'?: () => VNode[];
  /** Icon after the label, sized to 14px. */
  'right-icon'?: () => VNode[];
}>();

function hasRenderableNodes(nodes: VNode[]): boolean {
  return nodes.some((node) => {
    if (node.type === Comment) return false;
    if (node.type === Text) return String(node.children).trim().length > 0;
    if (node.type !== Fragment) return true;
    return (
      Array.isArray(node.children) &&
      hasRenderableNodes(node.children as VNode[])
    );
  });
}

function isIconOnly(): boolean {
  return (
    !props.isNumber &&
    Boolean(slots['left-icon'] || slots['right-icon']) &&
    !hasRenderableNodes(slots.default?.() ?? [])
  );
}
</script>

<template>
  <span
    data-slot="badge"
    :data-variant="variant"
    :data-fill="fill"
    :data-caps="isCaps"
    :data-number="isNumber || undefined"
    :data-icon-only="isIconOnly() || undefined"
    :role="isIconOnly() ? 'img' : undefined"
    :class="
      cn(
        badgeVariants({ variant, fill }),
        badgeShapeClasses(isNumber, isIconOnly(), isCaps),
        props.class
      )
    "
  >
    <span v-if="isIconOnly()" :class="badgeIconClasses">
      <slot v-if="slots['left-icon']" name="left-icon" />
      <slot v-else name="right-icon" />
    </span>
    <template v-else>
      <span
        v-if="slots['left-icon'] && !isNumber"
        aria-hidden="true"
        :class="badgeIconClasses"
      >
        <slot name="left-icon" />
      </span>
      <slot />
      <span
        v-if="slots['right-icon'] && !isNumber"
        aria-hidden="true"
        :class="badgeIconClasses"
      >
        <slot name="right-icon" />
      </span>
    </template>
  </span>
</template>
