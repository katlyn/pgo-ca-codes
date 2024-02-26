<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { fetchSheetName } from "../sheetUtils";

const emit = defineEmits<{ loaded: [] }>();
defineSlots<{
  name(props: { name: string }): unknown;
}>();

const props = defineProps<{ sheetKey: string }>();
const name = ref<string | null>(null);

async function fetchData() {
  name.value = await fetchSheetName(props.sheetKey);
  emit("loaded");
}

onMounted(fetchData);
watch(props, fetchData);
</script>

<template>
  <slot :value="name" />
</template>
