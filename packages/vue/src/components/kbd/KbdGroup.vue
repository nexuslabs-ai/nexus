<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface KbdGroupProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<KbdGroupProps>();
</script>

<template>
  <kbd
    data-slot="kbd-group"
    :class="cn('nx:inline-flex nx:items-center nx:gap-1', props.class)"
  >
    <slot />
  </kbd>
</template>
