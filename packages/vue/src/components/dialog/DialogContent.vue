<script setup lang="ts">
import { IconX } from '@tabler/icons-vue';
import { reactiveOmit } from '@vueuse/core';
import {
  DialogClose,
  DialogContent,
  type DialogContentEmits,
  type DialogContentProps as RekaDialogContentProps,
  DialogPortal,
  useForwardPropsEmits,
} from 'reka-ui';
import { Fragment, type HTMLAttributes, type VNode } from 'vue';

import { cn } from '../../lib/utils';
import {
  overlayCloseButtonClassName,
  overlayContentVariants,
} from '../overlay-layout/overlay-layout';

import DialogBody from './DialogBody.vue';
import DialogDescription from './DialogDescription.vue';
import DialogHeader from './DialogHeader.vue';
import DialogOverlay from './DialogOverlay.vue';
import DialogTitle from './DialogTitle.vue';

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
const slots = defineSlots<{
  default?(): VNode[];
  /**
   * Title for a generated header. Ignored when `DialogHeader` is a direct
   * child or inside a Fragment.
   */
  title?(): VNode[];
  /**
   * Description for a generated header. Ignored when a `DialogHeader` child is
   * present.
   */
  description?(): VNode[];
  /**
   * Content for a generated `DialogBody`, rendered before the default slot.
   * Ignored when a `DialogBody` child is present.
   */
  body?(): VNode[];
}>();

const delegated = reactiveOmit(props, 'class', 'showCloseButton');
const forwarded = useForwardPropsEmits(delegated, emits);

function containsComposedSlot(
  nodes: VNode[] | undefined,
  part: unknown
): boolean {
  return (nodes ?? []).some(
    (node) =>
      node.type === part ||
      (node.type === Fragment &&
        Array.isArray(node.children) &&
        containsComposedSlot(node.children as VNode[], part))
  );
}

const showGeneratedHeader = () =>
  !containsComposedSlot(slots.default?.(), DialogHeader) &&
  (slots.title !== undefined || slots.description !== undefined);
const showGeneratedBody = () =>
  !containsComposedSlot(slots.default?.(), DialogBody) &&
  slots.body !== undefined;
</script>

<template>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="dialog-content"
      data-variant="default"
      data-orientation="horizontal"
      :class="cn(overlayContentVariants(), props.class)"
    >
      <DialogHeader v-if="showGeneratedHeader()">
        <DialogTitle v-if="slots.title"><slot name="title" /></DialogTitle>
        <DialogDescription v-if="slots.description">
          <slot name="description" />
        </DialogDescription>
      </DialogHeader>
      <DialogBody v-if="showGeneratedBody()"><slot name="body" /></DialogBody>
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
