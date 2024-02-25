<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { CommunityEvent, V2, V2Transformed } from "../dataTransformers/V2";
import { SheetParameters } from "../sheetUtils";
import copy from "../copy";
import CopyButton from "./CopyButton.vue";

const props = defineProps<{ sheet: SheetParameters; selected: string }>();
const emit = defineEmits<{ loaded: [] }>();
defineSlots<{
  select(props: { options: string[] }): unknown;
}>();

const loaded = ref(false);
const communities = ref<V2Transformed>({});

const communityOptions = computed(() => {
  return Object.keys(communities.value).sort((a, b) => a.localeCompare(b));
});

const selectedCommunity = computed(() => {
  return communities.value[props.selected];
});

function sortEvents(events: CommunityEvent[]) {
  return [...events].sort((a, b) => a.date.getTime() - b.date.getTime());
}

async function fetchData() {
  const transformer = new V2(props.sheet);
  communities.value = await transformer.fetch();
  loaded.value = true;
  emit("loaded");
}

onMounted(fetchData);
watch(props, fetchData);
</script>

<template>
  <slot name="select" :options="communityOptions" />

  <template v-if="selectedCommunity">
    <h2>{{ selectedCommunity.name }}</h2>
    <template v-for="event in sortEvents(selectedCommunity.events)">
      <div class="flex justify-between items-center">
        <h3>{{ event.name }} - {{ event.date.toLocaleDateString() }}</h3>
        <CopyButton :data="event.codes.join(', ')">Copy Codes</CopyButton>
      </div>
      <ul class="list-disc ml-8">
        <li v-for="code in event.codes" class="font-mono">{{ code }}</li>
      </ul>
      <hr class="m-4" />
    </template>
  </template>
</template>
