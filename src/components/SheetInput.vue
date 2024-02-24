<script setup lang="ts">
import { AllowedVersions } from "../dataTransformers/Transformer";
import { ref } from "vue";
import { extractSheetParameters } from "../sheetUtils";
import ColumnMappingTable from "./ColumnMappingTable.vue";

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
  <p class="text-center mb-2">
    <span class="font-bold">Important:</span> you must use the full URL of the
    tab that has all codes on it.
  </p>
  <div class="flex gap-2 mb-6">
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

  <h2>Which version should I use?</h2>
  <p>
    The version you should use depends on the layout of the sheet you would like
    to get a URL for. You must use the correct version for the layout of the
    sheet, or data will not be pulled correctly. See below for a reference of
    what each sheet version looks like. In most cases, the newest version is the
    one you should select.
  </p>

  <dl>
    <dt>V1</dt>
    <dd>
      <ColumnMappingTable version="V1">
        Codes are contained within one tab, with only community names and codes
        specified.
      </ColumnMappingTable>
    </dd>

    <dt>V2</dt>
    <dd>
      <ColumnMappingTable version="V2">
        Multiple events per community are specified, with dates and events names
        alongside community names.
      </ColumnMappingTable>
    </dd>
  </dl>
</template>
