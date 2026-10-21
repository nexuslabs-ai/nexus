<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface CardTitleProps extends PrimitiveProps {
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<CardTitleProps>(), { as: 'h3' });
</script>

<template>
  <Primitive
    data-slot="card-title"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        'nx:col-start-1 nx:m-0 nx:min-w-0 nx:typography-heading-xsmall',
        props.class
      )
    "
  >
    <slot />
  </Primitive>
</template>
