<template>
  <table class="w-full table-auto">
    <thead class="bg-zinc-700">
      <tr class="py-1">
        <th class="text-start pl-2">
          Language
        </th>
        <th class="text-start">
          Extension
        </th>
        <th class="text-start">
          Files
        </th>
        <th class="text-start">
          Lines
        </th>
        <th class="text-start">
          Color
        </th>
        <th class="text-start">
          Remove
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="extension in extensionList"
        :key="extension.extension"
        class="bg-zinc-800 border border-zinc-700"
      >
        <td class="pl-2">
          {{ extension.language }}
        </td>
        <td>.{{ extension.extension }}</td>
        <td>{{ extension.count }}</td>
        <td>{{ extension.lines }}</td>
        <td>
          <PickColors
            v-model:value="extension.color"
            class="cursor-pointer"
            @change="updateExtension"
          />
        </td>
        <td>
          <button class="text-red-500 bg-transparent hover:background-white w-4 h-4 rounded-full">
            <CloseIcon class="w-4 h-4" />
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import PickColors from 'vue-pick-colors'

import type { Extension } from '../../utils/types'

import CloseIcon from '~icons/mdi/close-circle'

const props = defineProps<{
	extensionList: Extension[]
}>()

interface SettingViewEmits {
  (event: 'resetGraph'): void
	(event: 'updateExtension', extensionList: Extension[]): void
}

const emit = defineEmits<SettingViewEmits>()

const updateExtension = () => {
	emit('updateExtension', props.extensionList)
}
</script>
