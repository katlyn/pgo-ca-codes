<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { V1, V1Transformed } from "../dataTransformers/V1";
import { SheetParameters } from "../sheetUtils";
import copy from "../copy";
import CopyButton from "./CopyButton.vue";

const props = defineProps<{ sheet: SheetParameters; selected: string }>();
defineSlots<{
  loader(): unknown;
  select(props: { options: string[] }): unknown;
}>();

const loaded = ref(false);
const communities = ref<V1Transformed>({});

const communityOptions = computed(() => {
  return Object.keys(communities.value).sort((a, b) => a.localeCompare(b));
});

const selectedCommunity = computed(() => {
  return communities.value[props.selected];
});

async function fetchData() {
  const transformer = new V1(props.sheet);
  communities.value = await transformer.fetch();
  loaded.value = true;
}

onMounted(fetchData);
watch(props, fetchData);
</script>

<template>
  <template v-if="!loaded">
    <slot name="loader" />
  </template>
  <template v-else>
    <slot name="select" :options="communityOptions" />

    <template v-if="selectedCommunity">
      <div class="flex justify-between items-center">
        <h2>{{ selectedCommunity.name }}</h2>
        <CopyButton :data="selectedCommunity.codes.join(', ')">
          Copy Codes
        </CopyButton>
      </div>
      <ul class="list-disc ml-8">
        <li v-for="code in selectedCommunity.codes" class="font-mono">
          {{ code }}
        </li>
      </ul>
    </template>
  </template>
</template>
