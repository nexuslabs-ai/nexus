<script setup lang="ts">
import { IconX } from '@tabler/icons-vue';
import { reactiveOmit } from '@vueuse/core';
import {
  DialogClose,
  DialogContent,
  type DialogContentEmits,
  type DialogContentProps as RekaDialogContentProps,
  DialogOverlay,
  DialogPortal,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import {
  overlayCloseButtonClassName,
  overlayContentVariants,
  overlayScrimVariants,
} from '../overlay-layout/overlay-layout';

export interface DialogContentProps extends RekaDialogContentProps {
  /** Shows the close button in the top-right corner. */
  showCloseButton?: boolean;
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DialogContentProps>(), {
  showCloseButton: true,
});
const emits = defineEmits<DialogContentEmits>();

const delegated = reactiveOmit(props, 'class', 'showCloseButton');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <DialogPortal>
    <DialogOverlay data-slot="dialog-overlay" :class="overlayScrimVariants()" />
    <DialogContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="dialog-content"
      data-variant="default"
      data-orientation="horizontal"
      :class="cn(overlayContentVariants(), props.class)"
    >
      <slot />
      <DialogClose
        v-if="showCloseButton"
        data-slot="dialog-close-button"
        :class="overlayCloseButtonClassName"
      >
        <IconX class="nx:size-4" />
        <span class="nx:sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
