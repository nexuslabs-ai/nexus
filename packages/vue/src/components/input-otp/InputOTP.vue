<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  PinInputRoot,
  type PinInputRootEmits,
  type PinInputRootProps,
  useForwardPropsEmits,
} from 'reka-ui';
import { type HTMLAttributes, provide, useAttrs } from 'vue';

import { cn } from '../../lib/utils';

import { InputOTPKey } from '.';

export interface InputOTPProps extends PinInputRootProps {
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<InputOTPProps>(), {
  otp: true,
});
const emits = defineEmits<PinInputRootEmits>();

// The root is a role-less <div>, so each slot's <input> takes the naming and
// invalid ARIA instead.
const SLOT_ATTRS = ['aria-label', 'aria-labelledby', 'aria-invalid'];
const attrs = useAttrs();
provide(InputOTPKey, attrs);

function rootAttrs() {
  return Object.fromEntries(
    Object.entries(attrs).filter(([name]) => !SLOT_ATTRS.includes(name))
  );
}

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <PinInputRoot
    v-bind="{ ...forwarded, ...rootAttrs() }"
    data-slot="input-otp"
    :class="
      cn('nx:group/input-otp nx:flex nx:items-center nx:gap-2', props.class)
    "
  >
    <slot />
  </PinInputRoot>
</template>
