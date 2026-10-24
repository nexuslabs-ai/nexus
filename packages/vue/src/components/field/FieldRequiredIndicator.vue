<script setup lang="ts">
import type { HTMLAttributes, VNode } from 'vue';

import { cn } from '../../lib/utils';

export interface FieldRequiredIndicatorProps {
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = defineProps<FieldRequiredIndicatorProps>();

const slots = defineSlots<{
  default?: () => VNode[];
  /** Text for an optional field, shown instead of the `*`. Screen readers read it, and it overrides the default slot. */
  fallback?: () => VNode[];
}>();
</script>

<template>
  <span
    v-bind="$attrs"
    :aria-hidden="slots.fallback ? undefined : true"
    data-slot="field-required-indicator"
    :data-optional="slots.fallback ? 'true' : undefined"
    :class="
      cn(
        'nx:text-error-subtle-foreground nx:data-[optional=true]:typography-body-default nx:data-[optional=true]:text-muted-foreground',
        props.class
      )
    "
  >
    <slot v-if="slots.fallback" name="fallback" />
    <slot v-else>*</slot>
  </span>
</template>
