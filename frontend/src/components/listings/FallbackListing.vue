<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  CommunityEvent,
  FallbackTransformed,
  Fallback,
} from "../../dataTransformers/Fallback";
import { GSheetTab } from "../../sheetUtils";
import CopyButton from "../CopyButton.vue";

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
const communities = ref<FallbackTransformed>({});

const communityOptions = computed(() => {
  return Object.keys(communities.value).sort((a, b) => a.localeCompare(b));
});

const selectedCommunity = computed(() => {
  return communities.value[props.selected];
});

async function fetchData() {
  const transformer = new Fallback(props.sheetKey, props.tabs);
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
