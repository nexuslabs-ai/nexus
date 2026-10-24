<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import {
  visibilityClassName,
  type VisibilityProps,
} from '../../lib/responsive-visibility';
import { cn } from '../../lib/utils';

export type HideProps = VisibilityProps & {
  class?: HTMLAttributes['class'];
};

const props = withDefaults(defineProps<HideProps>(), { as: 'span' });
</script>

<template>
  <component
    :is="as"
    data-slot="hide"
    :class="cn(props.class, visibilityClassName(props, true))"
  >
    <slot />
  </component>
</template>
