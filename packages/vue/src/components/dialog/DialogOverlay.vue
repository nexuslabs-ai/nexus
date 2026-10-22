<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  DialogOverlay,
  type DialogOverlayProps as RekaDialogOverlayProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { overlayScrimVariants } from '../overlay-layout/overlay-layout';

export interface DialogOverlayProps extends RekaDialogOverlayProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DialogOverlayProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <DialogOverlay
    v-bind="forwarded"
    data-slot="dialog-overlay"
    :class="cn(overlayScrimVariants(), props.class)"
  />
</template>
