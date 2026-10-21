<script setup lang="ts">
import { IconLoader2 } from '@tabler/icons-vue';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SpinnerProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SpinnerProps>();
</script>

<template>
  <IconLoader2
    role="status"
    aria-label="Loading"
    data-slot="spinner"
    :class="cn('nx:size-4 nx:animate-spin', props.class)"
  />
</template>
