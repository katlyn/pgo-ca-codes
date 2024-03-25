<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from "vue";
import { AllowedVersions, versions } from "../dataTransformers";
import LoadingSpinner from "./LoadingSpinner.vue";
import SheetName from "./SheetName.vue";
import { fetchSheetTabs, GSheetTab } from "../sheetUtils";

const props = defineProps<{
  version: AllowedVersions;
  sheetKey: string;
}>();

const selectedCommunity = ref("");

const tabs = ref<GSheetTab[] | null>(null);

const codesLoaded = ref(false);
const nameLoaded = ref(false);
const loaded = computed(() => codesLoaded.value && nameLoaded.value);

const versions = {
  [AllowedVersions.Fallback]: defineAsyncComponent(
    () => import("./listings/FallbackListing.vue"),
  ),
  [AllowedVersions.V1]: defineAsyncComponent(
    () => import("./listings/V1Listing.vue"),
  ),
  [AllowedVersions.V2]: defineAsyncComponent(
    () => import("./listings/V2Listing.vue"),
  ),
};

onMounted(async () => {
  tabs.value = await fetchSheetTabs(props.sheetKey);
});
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
    :sheetKey="props.sheetKey"
    @loaded="nameLoaded = true"
    v-slot="{ value: name }"
  >
    <h1 v-if="loaded" class="text-center">{{ name }}</h1>
  </SheetName>
  <component
    v-if="tabs !== null"
    :is="versions[props.version]"
    :sheetKey="props.sheetKey"
    :tabs="tabs"
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
