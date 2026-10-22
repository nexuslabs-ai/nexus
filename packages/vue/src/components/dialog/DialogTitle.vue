<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  DialogTitle,
  type DialogTitleProps as RekaDialogTitleProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface DialogTitleProps extends RekaDialogTitleProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DialogTitleProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <DialogTitle
    v-bind="forwarded"
    data-slot="dialog-title"
    :class="cn('nx:m-0 nx:typography-heading-xsmall', props.class)"
  >
    <slot />
  </DialogTitle>
</template>
