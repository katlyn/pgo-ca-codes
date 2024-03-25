<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { V1, V1Transformed } from "../dataTransformers/V1";
import { GSheetTab, SheetParameters } from "../sheetUtils";
import CopyButton from "./CopyButton.vue";

const props = defineProps<{
  sheetKey: string;
  selected: string;
  tabs: GSheetTab[];
}>();
const emit = defineEmits<{ loaded: [] }>();
defineSlots<{
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
  const transformer = new V1(props.sheetKey, props.tabs);
  communities.value = await transformer.fetch();
  loaded.value = true;
  emit("loaded");
}

onMounted(fetchData);
watch(props, fetchData);
</script>

<template>
  <div>
    <slot name="select" :options="communityOptions" />

    <template v-if="selectedCommunity">
      <h2>{{ selectedCommunity.name }}</h2>
      <template v-if="selectedCommunity.research.length > 0">
        <div class="flex justify-between items-center">
          <h3>Research Codes</h3>
          <CopyButton :data="selectedCommunity.research.join(', ')">
            Copy Research Codes
          </CopyButton>
        </div>
        <ul class="list-disc ml-8">
          <li v-for="code in selectedCommunity.research" class="font-mono">
            {{ code }}
          </li>
        </ul>
      </template>
      <template v-if="selectedCommunity.bundle.length > 0">
        <div class="flex justify-between items-center">
          <h3>Bundle Codes</h3>
          <CopyButton :data="selectedCommunity.bundle.join(', ')">
            Copy Bundle Codes
          </CopyButton>
        </div>
        <ul class="list-disc ml-8">
          <li v-for="code in selectedCommunity.bundle" class="font-mono">
            {{ code }}
          </li>
        </ul>
      </template>
    </template>
  </div>
</template>
