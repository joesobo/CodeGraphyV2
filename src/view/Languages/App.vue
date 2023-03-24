<template>
  <div class="inline-block">
    <table class="mt-4">
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
              @change="updateD3Graph(nodes, extensionList)"
            />
          </td>
          <td class="pl-4">
            <button class="h-4 w-4 bg-transparent hover:bg-transparent">
              <CloseIcon
                class="h-4 w-4 rounded-full text-red-500 hover:bg-white"
              />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PickColors from 'vue-pick-colors'

import type { Connection, Extension, Node } from '../../utils/types'
import type { Ref } from 'vue'

import { updateD3Graph } from '../../utils/d3'
import { findMaxDepth } from '../../utils/depth'
import { getGraphData } from '../../utils/graphMessanger'
import { parseExtensions } from '../../utils/parseExtensions'
import { tableHeaders } from '../../utils/tableHeaders'

import CloseIcon from '~icons/mdi/close-circle'

let nodes: Ref<Node[] | undefined> = ref()
let connections: Ref<Connection[] | undefined> = ref()
let extensionList: Ref<Extension[]> = ref([])

// Display Settings
let connectionType: Ref<'Interaction' | 'Directory'> = ref('Interaction')
let nodeSize: Ref<string> = ref('Connections')
let selectedD3Color: Ref<string> = ref('Sinebow')

// D3 Settings
let nodeDepth: Ref<number> = ref(0)
let maxNodeDepth: Ref<number> = ref(0)

getGraphData({
	nodeSize: nodeSize.value,
	interactionConnections: connectionType.value,
	nodeDepth: nodeDepth.value,
})

window.addEventListener('message', (event) => {
	const message = event.data // The JSON data our extension sent
	switch (message.command) {
	case 'setGraphData':
		nodes.value = message.text.nodes
		connections.value = message.text.connections

		if (maxNodeDepth.value === 0) {
			maxNodeDepth.value = findMaxDepth(connections.value)
		}

		extensionList.value = parseExtensions(nodes.value, {
			useRandomColor: false,
			d3Color: selectedD3Color.value,
		})
		return
	}
})
</script>
