<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import type { LabelProps as RekaLabelProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { Label } from '../label';

export interface FieldLabelProps extends RekaLabelProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<FieldLabelProps>();

const delegated = reactiveOmit(props, 'class');
</script>

<template>
  <Label
    v-bind="delegated"
    data-slot="field-label"
    :class="
      cn(
        'nx:group/field-label nx:peer/field-label nx:flex nx:w-fit nx:gap-2 nx:group-data-[disabled=true]/field:text-disabled-foreground',
        'nx:has-[>[data-slot=field]]:w-full nx:has-[>[data-slot=field]]:flex-col nx:has-[>[data-slot=field]]:rounded-md nx:has-[>[data-slot=field]]:border-default nx:*:data-[slot=field]:p-4',
        'nx:has-data-[state=checked]:border-primary-border nx:has-data-[state=checked]:bg-primary-subtle',
        props.class
      )
    "
  >
    <slot />
  </Label>
</template>
