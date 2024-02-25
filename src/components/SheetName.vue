<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { fetchSheetName, SheetParameters } from "../sheetUtils";

const emit = defineEmits<{ loaded: [] }>();
defineSlots<{
  name(props: { name: string }): unknown;
}>();

const props = defineProps<{ sheet: SheetParameters }>();
const name = ref<string | null>(null);

async function fetchData() {
  name.value = await fetchSheetName(props.sheet.key);
  emit("loaded");
}

onMounted(fetchData);
watch(props, fetchData);
</script>

<template>
  <slot :value="name" />
</template>
