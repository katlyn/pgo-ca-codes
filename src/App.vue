<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";

const ListingSelect = defineAsyncComponent(
  () => import("./components/ListingSelect.vue"),
);
const SheetInput = defineAsyncComponent(
  () => import("./components/SheetInput.vue"),
);

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
    <header class="text-center"><a href=".">Pokémon GO CA Codes</a></header>
    <hr class="my-4" />
    <SheetInput v-if="!isOnSheetPage" />
    <ListingSelect v-else :sheet="params" :version="params.version" />
  </main>
</template>
