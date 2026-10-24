<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type InputGroupAddonVariants, inputGroupAddonVariants } from '.';

export interface InputGroupAddonProps {
  align?: InputGroupAddonVariants['align'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<InputGroupAddonProps>(), {
  align: 'inline-start',
});
</script>

<template>
  <div
    role="group"
    data-slot="input-group-addon"
    :data-align="align"
    :class="cn(inputGroupAddonVariants({ align }), props.class)"
  >
    <slot />
  </div>
</template>
