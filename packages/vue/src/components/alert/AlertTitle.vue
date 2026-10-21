<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface AlertTitleProps extends PrimitiveProps {
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<AlertTitleProps>(), { as: 'div' });
</script>

<template>
  <Primitive
    data-slot="alert-title"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        'nx:mt-0 nx:mb-1 nx:last:mb-0 nx:typography-label-default',
        props.class
      )
    "
  >
    <slot />
  </Primitive>
</template>
