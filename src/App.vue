<script setup lang="ts">
import { ref } from "vue";
import V2Listing from "./components/V2Listing.vue";
import { extractSheetParameters } from "./sheetUtils";
import V1Listing from "./components/V1Listing.vue";
import ListingSelect from "./components/ListingSelect.vue";
import SheetInput from "./components/SheetInput.vue";

const currentURL = new URL(window.location.href);
const params = {
  version: currentURL.searchParams.get("version"),
  key: currentURL.searchParams.get("key"),
  gid: currentURL.searchParams.get("gid"),
};

const isOnSheetPage = ref(Object.values(params).every((v) => v !== null));
</script>

<template>
  <main class="mx-auto max-w-prose p-8">
    <h1 class="text-center">Pokémon Go CA Codes</h1>
    <hr class="my-4" />
    <SheetInput v-if="!isOnSheetPage" />
    <ListingSelect v-else :sheet="params" :version="params.version" />
  </main>
</template>
