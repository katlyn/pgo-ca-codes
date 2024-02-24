<script setup lang="ts">
import { AllowedVersions } from "../dataTransformers/Transformer";
import { V1 } from "../dataTransformers/V1";
import { V2 } from "../dataTransformers/V2";
import { computed, useSlots } from "vue";

const props = defineProps<{ version: AllowedVersions }>();
const slots = useSlots();

const fakeSheet = { key: "", gid: "" };
const versions = {
  [AllowedVersions.V2]: new V2(fakeSheet),
  [AllowedVersions.V1]: new V1(fakeSheet),
};

const versionHeaders = computed(() =>
  Object.keys(versions[props.version].columnMapping),
);
const versionCells = computed(() =>
  Object.values(versions[props.version].columnMapping),
);
</script>

<template>
  <div class="relative overflow-x-auto">
    <table
      class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 border dark:border-gray-600"
    >
      <caption
        v-if="slots.default"
        class="text-slate-500 dark:text-slate-400 pt-4 text-xs caption-bottom"
      >
        <slot />
      </caption>
      <thead
        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
      >
        <tr>
          <th
            v-for="header in versionHeaders"
            scope="col"
            class="px-6 py-3 border dark:border-gray-600"
          >
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr class="bg-white dark:bg-gray-800">
          <td
            v-for="cell in versionCells"
            class="px-6 py-4 border dark:border-gray-600"
          >
            {{ cell }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
