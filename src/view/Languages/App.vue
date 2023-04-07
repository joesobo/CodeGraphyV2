<template>
  <table class="mt-4 w-full">
    <thead class="bg-zinc-700">
      <tr class="py-1">
        <th
          v-for="header in tableHeaders"
          :key="header"
          class="pl-4 text-start first:pl-2 last:pr-2"
        >
          {{ header }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="extension in extensionList"
        :key="extension.extension"
        class="border border-zinc-700 bg-zinc-800"
      >
        <td class="pl-2">.{{ extension.extension }}</td>
        <td class="pl-4">{{ extension.count }}</td>
        <td class="pl-4">{{ extension.lines }}</td>
        <td class="pl-4">
          <PickColors
            v-model:value="extension.color"
            class="cursor-pointer"
            @change="
              overrideExtensionColor(extension.extension, extension.color)
            "
          />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue'
import PickColors from 'vue-pick-colors'

import type { Connection, Extension, Node } from '../../utils/types'

import { findMaxDepth } from '../../utils/findMaxDepth'
import {
	getGraphData,
	overrideExtensionColor,
} from '../../utils/graphMessenger'
import { parseExtensions } from '../../utils/parseExtensions'

const tableHeaders = ['Extension', 'Files', 'Lines', 'Color']

let nodes: Ref<Node[]> = ref([])
let connections: Ref<Connection[]> = ref([])
let extensionList: Ref<Extension[]> = ref([])

// Display Settings
let connectionType: Ref<'Interaction' | 'Directory'> = ref('Interaction')
let nodeSize: Ref<string> = ref('Connections')
let nodeColor: Ref<string> = ref('D3')
let selectedD3Color: Ref<string> = ref('Spectral')

// D3 Settings
let nodeDepth: Ref<number> = ref(0)

// Extra Settings
let showNodeModules: Ref<boolean> = ref(false)
let showOrphans: Ref<boolean> = ref(false)
let showLabels: Ref<boolean> = ref(false)

window.addEventListener('message', (event) => {
	const message = event.data // The JSON data our extension sent
	switch (message.command) {
	case 'setSettings':
		connectionType.value = message.text.connectionType
		nodeSize.value = message.text.nodeSize
		nodeColor.value = message.text.nodeColor
		selectedD3Color.value = message.text.selectedD3Color
		showNodeModules.value = message.text.showNodeModules
		showOrphans.value = message.text.showOrphans
		showLabels.value = message.text.showLabels
		// showOutlines.value = message.text.showOutlines
		// doCollisions.value = message.text.doCollisions

		getGraphData({
			mode: connectionType.value,
			nodeSize: nodeSize.value,
			collapseFullPaths: [],
			nodeDepth: nodeDepth.value,
			showNodeModules: showNodeModules.value,
			showOrphans: showOrphans.value,
		})
		return
	case 'setGraphData':
		nodes.value = message.text.nodes
		connections.value = message.text.connections

		extensionList.value = parseExtensions(nodes.value, {
			useRandomColor: nodeColor.value === 'Random',
			overrideExtensionColors: extensionList.value.map((extension) => {
				return {
					extension: extension.extension,
					color: extension.color,
				}
			}),
			d3Color: selectedD3Color.value,
		})
		return
	}
})
</script>
