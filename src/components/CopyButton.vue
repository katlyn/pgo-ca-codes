<script setup lang="ts">
import copy from "../copy";
import { ref } from "vue";

const props = defineProps<{ data: string }>();

const copied = ref(false);

let copiedTimeout: number | null = null;

function clickHandler() {
  copy(props.data);
  copied.value = true;
  if (copiedTimeout) {
    clearTimeout(copiedTimeout);
  }
  copiedTimeout = setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <button @click="clickHandler" :class="{ copied }">
    <slot />
  </button>
</template>

<style scoped>
button {
  position: relative;

  &.copied:after {
    background: inherit;
    border-radius: inherit;
    padding: inherit;
    content: "Copied!";
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    position: absolute;
  }
}
</style>
