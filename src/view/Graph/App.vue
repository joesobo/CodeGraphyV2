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
            drawD3Graph({
              nodes,
              connections,
              extensions: extensionList,
              currentOpenFile,
            })
          "
        >
          <RestartIcon width="1.25rem" height="1.25rem" />
        </button>

        <button
          class="pointer-events-auto mt-4 mr-4 flex h-5 w-5 items-center justify-center bg-transparent p-0 text-white hover:bg-transparent hover:text-primary-hover"
          @click="displaySettingsPopup = true"
        >
          <SettingsIcon width="1.25rem" height="1.25rem" />
        </button>
      </div>
      <div class="flex">
        <p class="ml-4 mb-4 text-white">Count: {{ nodes?.length }}</p>
      </div>

      <!-- Settings Popup -->
      <div
        v-show="displaySettingsPopup"
        class="pointer-events-auto absolute top-0 right-0 mr-2 mt-2 flex max-h-96 w-full max-w-[200px] flex-col overflow-y-scroll rounded-md bg-dropdown pt-2 shadow-lg scrollbar-hide"
      >
        <div class="flex items-center justify-between px-2 text-lg">
          <h1 class="m-0 p-0 font-bold text-white">Settings</h1>
          <button
            class="flex h-5 w-5 items-center justify-center bg-transparent p-0 text-white hover:bg-transparent hover:text-primary-hover"
            @click="displaySettingsPopup = false"
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
              @input="(event: SliderInputEvent) => (linkForce = event.target.value)"
            />
            <SliderRow
              id="linkDistance"
              :value="linkDistance"
              label="Link Distance"
              :max="1000"
              :step="10"
              @input="(event: SliderInputEvent) => (linkDistance = event.target.value)"
            />
            <SliderRow
              id="chargeForce"
              :value="chargeForce"
              label="Charge Force"
              :min="-100"
              @input="(event: SliderInputEvent) => (chargeForce = event.target.value)"
            />
            <SliderRow
              id="centerForce"
              :value="centerForce"
              label="Center Force"
              :max="1"
              :step="0.01"
              @input="(event: SliderInputEvent) => (centerForce = event.target.value)"
            />
          </div>
        </Disclosure>
        <!-- Color Settings -->
        <Disclosure
          v-if="nodeColor === 'D3'"
          title="Colors"
          class="border-t border-border p-2"
        >
          <div class="mt-2 flex flex-col">
            <button
              v-for="color in colorSchemes"
              :key="color"
              class="mt-2 flex h-6 w-full items-center justify-center rounded-md"
              :style="getD3BackgroundColor(color)"
              @click="
                () => {
                  selectedD3Color = color
                  updateGraph()
                }
              "
            >
              {{ color }}
            </button>
          </div>
        </Disclosure>
        <!-- Extra Settings -->
        <Disclosure title="Extra" class="border-t border-border p-2">
          <div class="mt-2 flex flex-col">
            <ToggleSwitch
              label="Node Modules"
              :value="showNodeModules"
              @input="
                (e) => {
                  showNodeModules = e.target.checked
                  updateNodeSettings()
                }
              "
            />
            <ToggleSwitch label="Orphans" :value="true" />
            <ToggleSwitch label="Labels" :value="true" />
            <ToggleSwitch label="Outlines" />
            <ToggleSwitch label="Collisions" />
            <div class="mb-4 flex items-center">
              <PickColors v-model:value="lineColor" class="cursor-pointer" />
              <p class="ml-3 text-sm font-medium text-gray-300">Line Color</p>
            </div>
            <div class="mb-4 flex items-center">
              <SliderRow
                id="lineColor"
                label=""
                class="mt-0"
                :value="1"
                :min="0"
                :max="10"
              />
              <p class="ml-3 text-sm font-medium text-gray-300">Width</p>
            </div>
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
        (event: SliderInputEvent) => {
          nodeDepth = event.target.value
          updateNodeSettings()
        }
      "
    />

    <!-- Settings Tab Content -->
    <div class="mt-4 flex flex-col">
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
              (value: string) => {
                connectionType = value as 'Interaction' | 'Directory'
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
              (value: string) => {
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
              (value: string) => {
                nodeColor = value
                updateGraph()
              }
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3'
import { ref } from 'vue'
import PickColors from 'vue-pick-colors'

import type {
	Connection,
	D3Color,
	Extension,
	Node,
	SliderInputEvent,
} from '../../utils/types'
import type { Ref } from 'vue'

import Disclosure from '../../components/Disclosure.vue'
import SliderRow from '../../components/SliderRow.vue'
import SwitchButton from '../../components/SwitchButton.vue'
import ToggleSwitch from '../../components/ToggleSwitch.vue'
import { drawD3Graph, updateD3Graph } from '../../utils/d3'
import { colorSchemes, d3ColorSchemes } from '../../utils/d3ColorSchemes'
import { findMaxDepth } from '../../utils/depth'
import { fetchSettings, getGraphData } from '../../utils/graphMessanger'
import { parseExtensions } from '../../utils/parseExtensions'

import SettingsIcon from '~icons/ant-design/setting-filled'
import CloseIcon from '~icons/mdi/close-circle'
import RestartIcon from '~icons/mdi/restart'

let nodes: Ref<Node[] | undefined> = ref()
let connections: Ref<Connection[] | undefined> = ref()
let extensionList: Ref<Extension[]> = ref([])
let currentOpenFile: Ref<string> = ref('')

let displaySettingsPopup: Ref<boolean> = ref(false)

// Display Settings
let connectionType: Ref<'Interaction' | 'Directory'> = ref('Interaction')
let nodeSize: Ref<string> = ref('')
let nodeColor: Ref<string> = ref('')
let selectedD3Color: Ref<string> = ref('')

// D3 Settings
let nodeDepth: Ref<number> = ref(0)
let maxNodeDepth: Ref<number> = ref(0)
let centerForce: Ref<number> = ref(0)
let chargeForce: Ref<number> = ref(0)
let linkForce: Ref<number> = ref(0)
let linkDistance: Ref<number> = ref(0)

// Extra Settings
let showNodeModules: Ref<boolean> = ref(false)
let lineColor: Ref<string> = ref('#000000')

fetchSettings()

window.addEventListener('message', (event) => {
	const message = event.data // The JSON data our extension sent
	switch (message.command) {
	case 'setSettings':
		connectionType.value = message.text.connectionType
		nodeSize.value = message.text.nodeSize
		nodeColor.value = message.text.nodeColor
		selectedD3Color.value = message.text.selectedD3Color
		nodeDepth.value = message.text.nodeDepth
		maxNodeDepth.value = message.text.maxNodeDepth
		centerForce.value = message.text.centerForce
		chargeForce.value = message.text.chargeForce
		linkForce.value = message.text.linkForce
		linkDistance.value = message.text.linkDistance
		showNodeModules.value = message.text.showNodeModules
		lineColor.value = message.text.lineColor

		getGraphData({
			nodeSize: nodeSize.value,
			interactionConnections: connectionType.value,
			nodeDepth: nodeDepth.value,
			showNodeModules: showNodeModules.value,
		})
		return
	case 'setGraphData':
		nodes.value = message.text.nodes
		connections.value = message.text.connections
		currentOpenFile.value = message.text.currentOpenFile
		showNodeModules.value = message.text.showNodeModules

		if (maxNodeDepth.value === 0) {
			maxNodeDepth.value = findMaxDepth(connections.value)
		}

		extensionList.value = parseExtensions(nodes.value, {
			useRandomColor: false,
			d3Color: selectedD3Color.value,
		})
		drawD3Graph({
			nodes: nodes.value,
			connections: connections.value,
			extensions: extensionList.value,
			currentOpenFile: currentOpenFile.value,
		})
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
		showNodeModules: showNodeModules.value,
	})
}

// Update the graph without regenerating the nodes / connections
const updateGraph = () => {
	fetchSettings({ selectedD3Color: selectedD3Color.value })

	extensionList.value = parseExtensions(nodes.value, {
		useRandomColor: nodeColor.value === 'Random',
		d3Color: selectedD3Color.value,
	})
	updateD3Graph(nodes.value, extensionList.value)
}

const getD3BackgroundColor = (color: string) => {
	const selectedThemeInterpolator: ((t: number) => string) | undefined =
    d3ColorSchemes.find((theme: D3Color) => theme.name === color)?.interpolator
	const d3Color = d3
		.scaleSequential()
		.domain([1, 10])
		.interpolator(selectedThemeInterpolator ?? d3.interpolateRainbow)

	const colors = Array.from({ length: 11 }, (_, i) => d3Color(i))
	const gradient = `background-image: linear-gradient(to bottom right, ${colors.join(
		', ',
	)}); text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);`
	return gradient
}
</script>
