<script setup lang="ts">
import type { HTMLAttributes, VNode } from 'vue';

import { renderedNodes } from '../../lib/slots';
import { cn } from '../../lib/utils';

import type { FieldErrors } from '.';

export interface FieldErrorProps {
  /**
   * Validation errors to show. Duplicate messages show once, and several render
   * as a list. Ignored when the error has content of its own.
   */
  errors?: FieldErrors;
  class?: HTMLAttributes['class'];
}

const props = defineProps<FieldErrorProps>();

const slots = defineSlots<{ default?: () => VNode[] }>();

/** Unique, non-empty error messages in first-seen order. */
function dedupeErrorMessages(errors: FieldErrorProps['errors']): string[] {
  const seen = new Map<string, string>();
  for (const error of errors ?? []) {
    if (error?.message) seen.set(error.message, error.message);
  }
  return [...seen.values()];
}

function hasChildren() {
  return renderedNodes(slots.default?.()).length > 0;
}

function messages() {
  return hasChildren() ? [] : dedupeErrorMessages(props.errors);
}
</script>

<template>
  <div
    v-if="hasChildren() || messages().length > 0"
    role="alert"
    aria-atomic="true"
    data-slot="field-error"
    :class="
      cn(
        'nx:typography-body-default nx:text-error-subtle-foreground',
        props.class
      )
    "
  >
    <slot v-if="hasChildren()" />
    <template v-else-if="messages().length === 1">{{ messages()[0] }}</template>
    <ul
      v-else
      class="nx:my-0 nx:ml-4 nx:flex nx:list-disc nx:flex-col nx:gap-1 nx:pl-0"
    >
      <li v-for="message in messages()" :key="message">{{ message }}</li>
    </ul>
  </div>
</template>
