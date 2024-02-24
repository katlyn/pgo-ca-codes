<script setup lang="ts">
import { AllowedVersions } from "../dataTransformers/Transformer";
import { ref } from "vue";
import { extractSheetParameters } from "../sheetUtils";

const sheetURL = ref("");
const selectedVersion = ref<AllowedVersions>(AllowedVersions.V2);

function parseUrl() {
  try {
    const sheetParams = extractSheetParameters(sheetURL.value);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("version", selectedVersion.value);
    newUrl.searchParams.set("key", sheetParams.key);
    newUrl.searchParams.set("gid", sheetParams.gid);
    window.location.assign(newUrl);
  } catch (error) {
    console.error(error);
    alert("Unable to parse that sheet URL. Are you sure it's correct?");
  }
}
</script>

<template>
  <div class="flex gap-2">
    <input
      v-model="sheetURL"
      type="text"
      class="grow"
      placeholder="Sheet URL"
    />
    <select v-model="selectedVersion" class="w-24">
      <option
        v-for="version of Object.keys(AllowedVersions).sort().reverse()"
        :value="version"
      >
        {{ version }}
      </option>
    </select>
    <button @click="parseUrl" class="w-24">Go!</button>
  </div>
</template>
