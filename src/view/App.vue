<template>
  <div class="flex max-w-[500px] flex-col">
    <!-- D3 Graph -->
    <svg
      width="500"
      height="500"
      class="overflow-hidden bg-zinc-900"
    />

    <!-- Tab Switch -->
    <div class="mt-4 flex">
      <SwitchButton
        :options="['Languages', 'Settings']"
        :selected="activeTab"
        @update="(value) => activeTab = value"
      />
    </div>

    <!-- Language Tab Content -->
    <table
      v-show="activeTab === 'Languages'"
      class="mt-4 w-full table-auto"
    >
      <thead class="bg-zinc-700">
        <tr class="py-1 pl-2">
          <th
            v-for="header in tableHeaders"
            :key="header"
            class="text-start"
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
              @change="updateD3Graph(nodes, extensionList)"
            />
          </td>
          <td>
            <button class="h-4 w-4 bg-transparent hover:bg-transparent">
              <CloseIcon class="h-4 w-4 rounded-full text-red-500 hover:bg-white" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Settings Tab Content -->
    <div
      v-show="activeTab === 'Settings'"
      class="mt-4 flex flex-col"
    >
      <!-- Reset Graph Button -->
      <div class="mt-4 flex items-center">
        <button @click="drawD3Graph(nodes, connections, extensionList)">
          Reset Graph
        </button>
      </div>
      <!-- Node Connection Switch -->
      <div class="mt-4 flex items-center">
        <label class="w-1/3 text-sm font-medium text-gray-300">Connection</label>
        <div class="flex w-2/3">
          <SwitchButton
            :options="['Interaction', 'Directory']"
            :selected="connectionType"
            @update="(value) => {
              connectionType = value
              updateNodeSettings()
            }"
          />
        </div>
      </div>
      <!-- Node Display Switch -->
      <div class="mt-4 flex items-center">
        <label class="w-1/3 text-sm font-medium text-gray-300">Display</label>
        <div class="flex w-2/3">
          <SwitchButton :options="['Graph', 'Local']" />
        </div>
      </div>
      <!-- Node Size Switch -->
      <div class="mt-4 flex items-center">
        <label class="w-1/3 text-sm font-medium text-gray-300">Node Size</label>
        <div class="flex w-2/3">
          <SwitchButton
            :options="['Connections', 'Lines']"
            :selected="nodeSize"
            @update="(value) => {
              nodeSize = value
              updateNodeSettings()
            }"
          />
        </div>
      </div>
      <!-- Node Color Switch -->
      <div class="mt-4 flex items-center">
        <label class="w-1/3 text-sm font-medium text-gray-300">Node Color</label>
        <div class="flex w-2/3">
          <SwitchButton
            :options="['D3', 'Random']"
            :selected="nodeColor"
            @update="(value) => {
              nodeColor = value
              updateGraph()
            }"
          />
        </div>
      </div>
      <!-- D3 Color List -->
      <Dropdown
        title="D3 Color List"
        :options="colorSchemes"
        :initialActive="selectedD3Color"
        class="mt-4"
        @update="(value) => {
          selectedD3Color = value
          updateGraph()
        }"
      />
      <!-- D3 Settings -->
      <Disclosure
        title="D3"
        class="mt-4"
      >
        <div class="ml-auto flex w-2/3 flex-col">
          <SliderRow
            id="linkForce"
            :value="linkForce"
            label="Link Force"
            :min="-100"
            @input="event => linkForce = event.target.value"
          />
          <SliderRow
            id="linkDistance"
            :value="linkDistance"
            label="Link Distance"
            :max="1000"
            :step="10"
            @input="event => linkDistance = event.target.value"
          />
          <SliderRow
            id="chargeForce"
            :value="chargeForce"
            label="Charge Force"
            :min="-100"
            @input="event => chargeForce = event.target.value"
          />
          <SliderRow
            id="centerForce"
            :value="centerForce"
            label="Center Force"
            :max="1"
            :step="0.01"
            @input="event => centerForce = event.target.value"
          />
        </div>
      </Disclosure>
      <!-- Extra Settings -->
      <Disclosure
        title="Extra"
        class="mt-4"
      >
        <div class="ml-auto mt-2 flex w-2/3 flex-col">
          <ToggleSwitch label="Hide Orphans" />
          <ToggleSwitch label="Hide Labels" />
          <div>Line width</div>
          <div>Line color</div>
          <ToggleSwitch label="Outlines" />
          <ToggleSwitch label="Collions" />
        </div>
      </Disclosure>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
import { ref } from 'vue'
import PickColors from 'vue-pick-colors'

import { drawD3Graph, updateD3Graph } from '../utils/d3'
import { colorSchemes } from '../utils/d3ColorSchemes'
import { getGraphData } from '../utils/graphMessanger'
import { parseExtensions } from '../utils/parseExtensions'
import { tableHeaders } from '../utils/tableHeaders'
import type { Connection, Extension, Node } from '../utils/types'

import Disclosure from './components/Disclosure.vue'
import Dropdown from './components/Dropdown.vue'
import SliderRow from './components/SliderRow.vue'
import SwitchButton from './components/SwitchButton.vue'
import ToggleSwitch from './components/ToggleSwitch.vue'

import CloseIcon from '~icons/mdi/close-circle'

let nodes: Ref<Node[] | undefined> = ref()
let connections: Ref<Connection[] | undefined> = ref()
let extensionList: Ref<Extension[]> = ref([])

// Display Settings
let activeTab: Ref<string> = ref('Settings')
let connectionType: Ref<string> = ref('Interaction')
let nodeSize: Ref<string> = ref('Connections')
let nodeColor: Ref<string> = ref('D3')
let selectedD3Color: Ref<string> = ref('Sinebow')

// D3 Settings
let centerForce: Ref<number> = ref(0)
let chargeForce: Ref<number> = ref(-100)
let linkForce: Ref<number> = ref(0)
let linkDistance: Ref<number> = ref(100)

getGraphData({ nodeSize: nodeSize.value, interactionConnections: connectionType.value })

window.addEventListener('message', (event) => {
	const message = event.data // The JSON data our extension sent
	switch (message.command) {
	case 'setGraphData':
		nodes.value = message.text.nodes
		connections.value = message.text.connections

		extensionList.value = parseExtensions(nodes.value, { useRandomColor: false, d3Color: selectedD3Color.value })
		drawD3Graph(nodes.value, connections.value, extensionList.value)
		return
	}
})

// Update the graph with new settings
const updateNodeSettings = () => {
	getGraphData({ nodeSize: nodeSize.value, interactionConnections: connectionType.value })
}

// Update the graph without regenerating the nodes / connections
const updateGraph = () => {
	extensionList.value = parseExtensions(nodes.value, { useRandomColor: nodeColor.value === 'Random', d3Color: selectedD3Color.value })
	updateD3Graph(nodes.value, extensionList.value)
}
</script>
