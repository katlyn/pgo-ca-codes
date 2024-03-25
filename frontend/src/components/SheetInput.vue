<script setup lang="ts">
import { AllowedVersions, orderedVersions } from "../dataTransformers";
import { ref } from "vue";
import { extractSheetKey, fetchSheetTabs, GSheetTab } from "../sheetUtils";

const sheetURL = ref("");

function guessVersion(tabs: GSheetTab[]): AllowedVersions | null {
  for (const version of orderedVersions) {
    if (version.matchesVersion(tabs)) {
      return version.version;
    }
  }
  return null;
}

async function parseUrl() {
  try {
    const sheetKey = extractSheetKey(sheetURL.value);
    if (sheetKey === null) {
      alert("The provided URL does not point to a Google Sheet.");
      return;
    }

    const tabs = await fetchSheetTabs(sheetKey);
    const version = guessVersion(tabs);
    if (version === null) {
      alert(
        "Unable to determine layout version number. Are you sure the provided URL goes to the correct Google Sheet?",
      );
      return;
    }

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("version", version);
    newUrl.searchParams.set("key", sheetKey);
    console.log(newUrl);
    window.location.assign(newUrl);
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "Fetching sheet not OK": {
          alert(
            'Unable to access the provided Google Sheet. Is sharing set to "anyone with the link" and has the correct URL been provided?',
          );
          return;
        }
      }
    }
    console.error(error);
    alert(
      "An issue occurred while attempting to fetch information for this sheet. See console for more information.",
    );
  }
}
</script>

<template>
  <p class="text-center mb-2">
    <span class="font-bold">Important:</span>
    the sheet must have sharing set to "anyone with link".
  </p>
  <form @submit.prevent="parseUrl" autocomplete="off" class="flex gap-2 mb-6">
    <label for="url-input" class="sr-only">Sheet URL</label>
    <input
      v-model="sheetURL"
      id="url-input"
      type="text"
      class="grow"
      placeholder="Sheet URL"
    />
    <!--
    <label for="version-select" class="sr-only">Version</label>
    <select v-model="selectedVersion" id="version-select" class="w-24">
      <option value="auto">Auto</option>
      <option
        v-for="version of Object.keys(AllowedVersions).sort().reverse()"
        :value="version"
      >
        {{ version }}
      </option>
    </select>
    -->
    <button type="submit" class="w-24">Go!</button>
  </form>

  <!--
  <h2>Which version should I use?</h2>
  <p>
    The version you should use depends on the layout of the sheet you would like
    to get a URL for. You must use the correct version for the layout of the
    sheet, or data will not be pulled correctly. See below for a reference of
    what each sheet version looks like. In most cases, selecting Auto will be
    able to successfully identify which sheet version you are using.
  </p>

  <dl>
    <dt>V1</dt>
    <dd>
      <p>
        V1 sheets have a hidden tab titled <code>BUNDLES</code> formatted with
        the following columns:
      </p>
      <ColumnMappingTable version="V1">
        Codes are contained within one tab, with only community names and codes
        specified.
      </ColumnMappingTable>
    </dd>

    <dt>V2</dt>
    <dd>
      <p>
        V2 sheets have a hidden tab titled <code>Codes</code> formatted with the
        following columns:
      </p>
      <ColumnMappingTable version="V2">
        Multiple events per community are specified, with dates and events names
        alongside community names.
      </ColumnMappingTable>
    </dd>
  </dl>
  -->
</template>
