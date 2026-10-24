<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { Label as LabelRoot, type LabelProps as RekaLabelProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface LabelProps extends RekaLabelProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<LabelProps>();

const delegated = reactiveOmit(props, 'class');
</script>

<template>
  <LabelRoot
    v-bind="delegated"
    data-slot="label"
    :class="
      cn(
        'nx:flex nx:items-center nx:gap-2 nx:select-none nx:typography-label-default nx:text-foreground',
        'nx:peer-disabled:cursor-not-allowed nx:peer-disabled:text-disabled-foreground',
        props.class
      )
    "
  >
    <slot />
  </LabelRoot>
</template>
