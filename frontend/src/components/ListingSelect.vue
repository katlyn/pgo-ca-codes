<script setup lang="ts">
import { SheetParameters } from "../sheetUtils";
import { computed, defineAsyncComponent, ref } from "vue";
import { AllowedVersions, versions } from "../dataTransformers";
import LoadingSpinner from "./LoadingSpinner.vue";
import SheetName from "./SheetName.vue";

const props = defineProps<{
  version: AllowedVersions;
  sheet: SheetParameters;
}>();

const selectedCommunity = ref("");
const codesLoaded = ref(false);
const nameLoaded = ref(false);
const loaded = computed(() => codesLoaded.value && nameLoaded.value);

const versions = {
  [AllowedVersions.V1]: defineAsyncComponent(() => import("./V1Listing.vue")),
  [AllowedVersions.V2]: defineAsyncComponent(() => import("./V2Listing.vue")),
};
</script>

<template>
  <div
    v-if="!loaded"
    role="status"
    class="flex items-center gap-4 justify-center"
  >
    <LoadingSpinner />
    Loading codes...
  </div>
  <SheetName
    :sheet="sheet"
    @loaded="nameLoaded = true"
    v-slot="{ value: name }"
  >
    <h1 v-if="loaded" class="text-center">{{ name }}</h1>
  </SheetName>
  <component
    :is="versions[version]"
    :sheet="sheet"
    :selected="selectedCommunity"
    @loaded="codesLoaded = true"
  >
    <template #select="{ options }">
      <div v-if="loaded">
        <label for="community-select" class="sr-only">Community</label>
        <select v-model="selectedCommunity" id="community-select" class="mb-4">
          <option value="" disabled>Select your community</option>
          <option v-for="community in options" :value="community">
            {{ community }}
          </option>
        </select>
      </div>
    </template>
  </component>
</template>
