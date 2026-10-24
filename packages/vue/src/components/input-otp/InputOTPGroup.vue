<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface InputOTPGroupProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<InputOTPGroupProps>();
</script>

<template>
  <div
    data-slot="input-otp-group"
    :class="cn('nx:isolate nx:flex nx:items-center', props.class)"
  >
    <slot />
  </div>
</template>
