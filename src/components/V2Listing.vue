<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import V2, { V2Transformed } from "../dataTransformers/V2";
import { SheetParameters } from "../sheetUtils";

const props = defineProps<{ sheet: SheetParameters }>();

const loaded = ref(false);
const selected = ref("");
const communities = ref<V2Transformed>({});

const communityOptions = computed(() => {
  return Object.keys(communities.value).sort((a, b) => a.localeCompare(b));
});

const selectedCommunity = computed(() => {
  return communities.value[selected.value];
});

async function fetchData() {
  const transformer = new V2(props.sheet);
  communities.value = await transformer.fetch();
  loaded.value = true;
}

onMounted(fetchData);
watch(props, fetchData);
</script>

<template>
  <template v-if="!loaded"><slot name="loader" /></template>
  <template v-else>
    <select v-model="selected">
      <option value="" disabled>Select your community</option>
      <option v-for="community in communityOptions" :value="community">
        {{ community }}
      </option>
    </select>

    <template v-if="selectedCommunity">
      <h2>{{ selectedCommunity.name }}</h2>
      <template v-for="event in selectedCommunity.events">
        <h3>{{ event.name }} - {{ event.date.toDateString() }}</h3>
        <ul>
          <li v-for="code in event.codes">{{ code }}</li>
        </ul>
        <hr />
      </template>
    </template>
  </template>
</template>
