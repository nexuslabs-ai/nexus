<script setup lang="ts">
import { IconPointFilled } from '@tabler/icons-vue';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface InputOTPSeparatorProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<InputOTPSeparatorProps>();
</script>

<template>
  <div
    data-slot="input-otp-separator"
    aria-hidden="true"
    :class="cn('nx:flex nx:items-center', props.class)"
  >
    <IconPointFilled class="nx:size-2.5 nx:text-muted-foreground" />
  </div>
</template>
