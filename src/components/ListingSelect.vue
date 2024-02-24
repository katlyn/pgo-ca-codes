<script setup lang="ts">
import { SheetParameters } from "../sheetUtils";
import { ref } from "vue";
import { AllowedVersions } from "../dataTransformers/Transformer";
import V1Listing from "./V1Listing.vue";
import V2Listing from "./V2Listing.vue";
import LoadingSpinner from "./LoadingSpinner.vue";

const props = defineProps<{
  version: AllowedVersions;
  sheet: SheetParameters;
}>();

const selectedCommunity = ref("");

const versions = {
  [AllowedVersions.V1]: V1Listing,
  [AllowedVersions.V2]: V2Listing,
};
</script>

<template>
  <component
    :is="versions[version]"
    :sheet="sheet"
    :selected="selectedCommunity"
  >
    <template v-slot:loader>
      <div role="status" class="flex items-center gap-4">
        <LoadingSpinner />
        Loading communities...
      </div>
    </template>
    <template #select="{ options }">
      <label for="community-select" class="sr-only">Community</label>
      <select v-model="selectedCommunity" id="community-select" class="mb-4">
        <option value="" disabled>Select your community</option>
        <option v-for="community in options" :value="community">
          {{ community }}
        </option>
      </select>
    </template>
  </component>
</template>
