<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  RadioGroupRoot,
  type RadioGroupRootEmits,
  type RadioGroupRootProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface RadioGroupProps extends RadioGroupRootProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<RadioGroupProps>();
const emits = defineEmits<RadioGroupRootEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <RadioGroupRoot
    v-bind="forwarded"
    data-slot="radio-group"
    :class="cn('nx:grid nx:gap-2', props.class)"
  >
    <slot />
  </RadioGroupRoot>
</template>
