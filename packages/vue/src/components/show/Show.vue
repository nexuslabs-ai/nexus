<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import {
  visibilityClassName,
  type VisibilityProps,
} from '../../lib/responsive-visibility';
import { cn } from '../../lib/utils';

export type ShowProps = VisibilityProps & {
  class?: HTMLAttributes['class'];
};

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
