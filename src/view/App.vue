<template>
  <div class="flex max-w-[500px] flex-col">
    <!-- D3 Graph -->
    <svg width="500" height="500" class="overflow-hidden bg-zinc-900" />

    <!-- Graph Overlay -->
    <div
      class="pointer-events-none absolute flex h-[500px] w-[500px] flex-col justify-between"
    >
      <div class="flex justify-end">
        <button
          class="pointer-events-auto mt-4 mr-4 flex h-5 w-5 items-center justify-center bg-transparent p-0 text-white hover:bg-transparent hover:text-primary-hover"
          @click="
            drawD3Graph(nodes, connections, extensionList, currentOpenFile)
          "
        >
          <RestartIcon width="1.25rem" height="1.25rem" />
        </button>

        <button
          class="pointer-events-auto mt-4 mr-4 flex h-5 w-5 items-center justify-center bg-transparent p-0 text-white hover:bg-transparent hover:text-primary-hover"
          @click="displaySettings = true"
        >
          <SettingsIcon width="1.25rem" height="1.25rem" />
        </button>
      </div>
      <div class="flex">
        <p class="ml-4 mb-4 text-white">Count: {{ nodes?.length }}</p>
      </div>

      <!-- Settings Popup -->
      <div
        v-show="displaySettings"
        class="pointer-events-auto absolute top-0 right-0 mr-2 mt-2 flex max-h-96 w-full max-w-[200px] flex-col overflow-y-scroll rounded-md bg-dropdown pt-2 shadow-lg scrollbar-hide"
      >
        <div class="flex items-center justify-between px-2 text-lg">
          <h1 class="m-0 p-0 font-bold text-white">Settings</h1>
          <button
            class="flex h-5 w-5 items-center justify-center bg-transparent p-0 text-white hover:bg-transparent hover:text-primary-hover"
            @click="displaySettings = false"
          >
            <CloseIcon width="1.25rem" height="1.25rem" />
          </button>
        </div>
        <!-- D3 Settings -->
        <Disclosure title="D3" class="mt-4 border-t border-border p-2">
          <div class="flex flex-col">
            <SliderRow
              id="linkForce"
              :value="linkForce"
              label="Link Force"
              :min="-100"
              @input="(event) => (linkForce = event.target.value)"
            />
            <SliderRow
              id="linkDistance"
              :value="linkDistance"
              label="Link Distance"
              :max="1000"
              :step="10"
              @input="(event) => (linkDistance = event.target.value)"
            />
            <SliderRow
              id="chargeForce"
              :value="chargeForce"
              label="Charge Force"
              :min="-100"
              @input="(event) => (chargeForce = event.target.value)"
            />
            <SliderRow
              id="centerForce"
              :value="centerForce"
              label="Center Force"
              :max="1"
              :step="0.01"
              @input="(event) => (centerForce = event.target.value)"
            />
          </div>
        </Disclosure>
        <!-- Extra Settings -->
        <Disclosure title="Extra" class="border-t border-border p-2">
          <div class="mt-2 flex flex-col">
            <ToggleSwitch label="Hide Orphans" />
            <ToggleSwitch label="Hide Labels" />
            <div>Line width:</div>
            <div>Line color:</div>
            <ToggleSwitch label="Outlines" />
            <ToggleSwitch label="Collions" />
          </div>
        </Disclosure>
      </div>
    </div>

    <!-- Depth Slider -->
    <SliderRow
      id="nodeDepth"
      label="Node Depth"
      class="mt-2"
      :value="nodeDepth"
      :min="0"
      :max="maxNodeDepth"
      @input="
        (event) => {
          nodeDepth = event.target.value
          updateNodeSettings()
        }
      "
    />

    <!-- Tab Switch -->
    <div class="mt-4 flex">
      <SwitchButton
        :options="['Languages', 'Settings']"
        :selected="activeTab"
        @update="(value) => (activeTab = value)"
      />
    </div>

    <!-- Language Tab Content -->
    <table v-show="activeTab === 'Languages'" class="mt-4 w-full table-auto">
      <thead class="bg-zinc-700">
        <tr class="py-1 pl-2">
          <th v-for="header in tableHeaders" :key="header" class="text-start">
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
              <CloseIcon
                class="h-4 w-4 rounded-full text-red-500 hover:bg-white"
              />
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Settings Tab Content -->
    <div v-show="activeTab === 'Settings'" class="mt-4 flex flex-col">
      <!-- Node Connection Switch -->
      <div class="mt-4 flex items-center">
        <label class="w-1/3 text-sm font-medium text-gray-300">
          Connection
        </label>
        <div class="flex w-2/3">
          <SwitchButton
            :options="['Interaction', 'Directory']"
            :selected="connectionType"
            @update="
              (value) => {
                connectionType = value
                updateNodeSettings()
              }
            "
          />
        </div>
      </div>
      <!-- Node Size Switch -->
      <div class="mt-4 flex items-center">
        <label class="w-1/3 text-sm font-medium text-gray-300">Node Size</label>
        <div class="flex w-2/3">
          <SwitchButton
            :options="['Connections', 'Lines']"
            :selected="nodeSize"
            @update="
              (value) => {
                nodeSize = value
                updateNodeSettings()
              }
            "
          />
        </div>
      </div>
      <!-- Node Color Switch -->
      <div class="mt-4 flex items-center">
        <label class="w-1/3 text-sm font-medium text-gray-300">
          Node Color
        </label>
        <div class="flex w-2/3">
          <SwitchButton
            :options="['D3', 'Random']"
            :selected="nodeColor"
            @update="
              (value) => {
                nodeColor = value
                updateGraph()
              }
            "
          />
        </div>
      </div>
      <!-- D3 Color List -->
      <Dropdown
        v-if="nodeColor === 'D3'"
        title="D3 Color List"
        :options="colorSchemes"
        :initialActive="selectedD3Color"
        class="mt-4"
        @update="
          (value) => {
            selectedD3Color = value
            updateGraph()
          }
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PickColors from 'vue-pick-colors'

import type { Connection, Extension, Node } from '../utils/types'
import type { Ref } from 'vue'

import Disclosure from './components/Disclosure.vue'
import Dropdown from './components/Dropdown.vue'
import SliderRow from './components/SliderRow.vue'
import SwitchButton from './components/SwitchButton.vue'
import ToggleSwitch from './components/ToggleSwitch.vue'
import { drawD3Graph, updateD3Graph } from '../utils/d3'
import { colorSchemes } from '../utils/d3ColorSchemes'
import { findMaxDepth } from '../utils/depth'
import { getGraphData } from '../utils/graphMessanger'
import { parseExtensions } from '../utils/parseExtensions'
import { tableHeaders } from '../utils/tableHeaders'

import SettingsIcon from '~icons/ant-design/setting-filled'
import CloseIcon from '~icons/mdi/close-circle'
import RestartIcon from '~icons/mdi/restart'

let nodes: Ref<Node[] | undefined> = ref()
let connections: Ref<Connection[] | undefined> = ref()
let extensionList: Ref<Extension[]> = ref([])
let currentOpenFile: Ref<string> = ref('')

let displaySettings: Ref<boolean> = ref(false)

// Display Settings
let activeTab: Ref<string> = ref('Settings')
let connectionType: Ref<string> = ref('Interaction')
let nodeSize: Ref<string> = ref('Connections')
let nodeColor: Ref<string> = ref('D3')
let selectedD3Color: Ref<string> = ref('Sinebow')

// D3 Settings
let nodeDepth: Ref<number> = ref(0)
let maxNodeDepth: Ref<number> = ref(0)
let centerForce: Ref<number> = ref(0)
let chargeForce: Ref<number> = ref(-100)
let linkForce: Ref<number> = ref(0)
let linkDistance: Ref<number> = ref(100)

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
      currentOpenFile.value = message.text.currentOpenFile

      if (maxNodeDepth.value === 0) {
        maxNodeDepth.value = findMaxDepth(connections.value)
      }

      extensionList.value = parseExtensions(nodes.value, {
        useRandomColor: false,
        d3Color: selectedD3Color.value,
      })
      drawD3Graph(
        nodes.value,
        connections.value,
        extensionList.value,
        currentOpenFile.value,
      )
      return
    case 'setCurrentFile':
      currentOpenFile.value = message.text
      updateD3Graph(nodes.value, extensionList.value, currentOpenFile.value)
      return
  }
})

// Update the graph with new settings
const updateNodeSettings = () => {
  getGraphData({
    nodeSize: nodeSize.value,
    interactionConnections: connectionType.value,
    nodeDepth: nodeDepth.value,
  })
}

// Update the graph without regenerating the nodes / connections
const updateGraph = () => {
  extensionList.value = parseExtensions(nodes.value, {
    useRandomColor: nodeColor.value === 'Random',
    d3Color: selectedD3Color.value,
  })
  updateD3Graph(nodes.value, extensionList.value)
}
</script>
