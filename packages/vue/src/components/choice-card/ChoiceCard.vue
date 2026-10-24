<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import type { LabelProps as RekaLabelProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { Label } from '../label';

import { type ChoiceCardVariants, choiceCardVariants } from '.';

export interface ChoiceCardProps extends Omit<RekaLabelProps, 'asChild'> {
  variant?: ChoiceCardVariants['variant'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ChoiceCardProps>(), {
  variant: 'bordered',
});

const delegated = reactiveOmit(props, 'class', 'variant');
</script>

<template>
  <Label
    v-bind="delegated"
    data-slot="choice-card"
    :data-variant="variant"
    :class="cn(choiceCardVariants({ variant }), props.class)"
  >
    <slot />
  </Label>
</template>
