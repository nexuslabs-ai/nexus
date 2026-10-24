<script setup lang="ts">
import {
  AspectRatio,
  type AspectRatioProps as RekaAspectRatioProps,
} from 'reka-ui';

export type AspectRatioProps = RekaAspectRatioProps;

const props = defineProps<AspectRatioProps>();
</script>

<template>
  <AspectRatio v-bind="props" data-slot="aspect-ratio">
    <slot />
  </AspectRatio>
</template>
