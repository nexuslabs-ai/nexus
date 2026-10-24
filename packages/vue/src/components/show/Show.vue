<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { visibilityClassName } from '../../lib/responsive-visibility';
import { cn } from '../../lib/utils';

export interface ShowProps {
  /**
   * Wrapper tag: `span` (inline) or `div` (block) — match the child's layout.
   * Tag-only and non-semantic: `display: contents` can
   * drop a semantic element's box from the accessibility tree, so put semantics
   * on a child *inside* `<Show>` / `<Hide>` instead.
   */
  as?: 'span' | 'div';
  above?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  below?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  containerAbove?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  containerBelow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ShowProps>(), { as: 'span' });
</script>

<template>
  <component
    :is="as"
    data-slot="show"
    :class="cn(props.class, visibilityClassName(props, false))"
  >
    <slot />
  </component>
</template>
