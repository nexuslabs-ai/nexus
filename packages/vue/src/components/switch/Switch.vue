<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  SwitchRoot,
  type SwitchRootEmits,
  type SwitchRootProps,
  SwitchThumb,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { switchThumbVariants, type SwitchVariants, switchVariants } from '.';

export interface SwitchProps extends SwitchRootProps {
  size?: SwitchVariants['size'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<SwitchProps>(), { size: 'default' });
const emits = defineEmits<SwitchRootEmits>();

const delegated = reactiveOmit(props, 'class', 'size');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <SwitchRoot
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="switch"
    :data-size="size"
    :class="cn(switchVariants({ size }), props.class)"
  >
    <SwitchThumb
      data-slot="switch-thumb"
      :class="switchThumbVariants({ size })"
    >
      <slot name="thumb" v-bind="slotProps" />
    </SwitchThumb>
  </SwitchRoot>
</template>
