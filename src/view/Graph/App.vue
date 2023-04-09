<template>
  <div class="flex max-w-[500px] flex-col">
    <!-- D3 Graph -->
    <svg width="500" height="500" class="overflow-hidden bg-zinc-900" />

    <!-- Graph Overlay -->
    <div
      class="pointer-events-none absolute flex h-[500px] w-[500px] flex-col justify-between"
    >
      <!-- Top Row -->
      <div class="flex justify-between">
        <!-- Node Count -->
        <p class="ml-4 mt-4 text-white">Count: {{ nodes?.length }}</p>

        <!-- Icons -->
        <div class="flex">
          <!-- Restart -->
					<Popper
            content="Refresh the graph"
            hover
            arrow
            openDelay="500"
          >
					<button
							id="restart"
              class="pointer-events-auto mt-4 mr-4 flex h-5 w-5 items-center justify-center bg-transparent p-0 text-white hover:bg-transparent hover:text-primary-hover"
              @click="drawGraph()"
            >
              <RestartIcon width="1.25rem" height="1.25rem" />
            </button>
          </Popper>

          <!-- Connections -->
          <Popper
            content="Toggle between connections and directory"
            hover
            arrow
            openDelay="500"
            placement="bottom-start"
            arrowPadding="20px"
          >
            <button
              id="connections"
              class="pointer-events-auto mt-4 mr-4 flex h-5 w-5 items-center justify-center bg-transparent p-0 text-white hover:bg-transparent hover:text-primary-hover"
              @click="
                () => {
                  connectionType =
                    connectionType === 'Interaction'
                      ? 'Directory'
                      : 'Interaction'
                  if (connectionType === 'Directory') {
                    nodeSize = 'Lines'
                  }
                  updateNodeSettings()
                  setLanguageViewSettings({
                    mode: connectionType,
                    nodeColor: nodeColor,
                    selectedD3Color: selectedD3Color,
                  })
                }
              "
            >
              <GraphIcon
                v-if="connectionType === 'Interaction'"
                width="1.25rem"
                height="1.25rem"
              />
              <DirectoryIcon v-else width="1.25rem" height="1.25rem" />
            </button>
          </Popper>

          <!-- Settings -->
          <Popper
            content="Open the settings popup"
            hover
            arrow
            openDelay="500"
            placement="bottom-start"
            arrowPadding="20px"
          >
            <button
              id="settings"
              class="pointer-events-auto mt-4 mr-4 flex h-5 w-5 items-center justify-center bg-transparent p-0 text-white hover:bg-transparent hover:text-primary-hover"
              @click="displaySettingsPopup = true"
            >
              <SettingsIcon width="1.25rem" height="1.25rem" />
            </button>
          </Popper>
        </div>
      </div>

      <!-- Bottom Row -->
      <!-- Depth Slider -->
      <SliderRowIcon
        id="nodeDepth"
        label="Node Depth"
        class="pointer-events-auto"
        :value="nodeDepth"
        :min="0"
        :max="maxNodeDepth"
        @input="
				(event: SliderInputEvent) => {
					nodeDepth = Number.parseInt(event.target.value.toString())
					updateNodeSettings()
				}
			"
      >
        <DepthGraphIcon
          width="1.25rem"
          height="1.25rem"
          class="mr-2 text-white"
        />
      </SliderRowIcon>

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
              id="linkDistance"
              :value="linkDistance"
              label="Link Distance"
              :max="250"
              :step="10"
              @input="(event: SliderInputEvent) => linkDistance = Number.parseInt(event.target.value.toString())"
              @mouseup="() => saveSettings()"
            />
            <SliderRow
              id="chargeForce"
              :value="chargeForce"
              label="Charge Force"
              :min="-100"
              :max="100"
              @input="(event: SliderInputEvent) => chargeForce = Number.parseInt(event.target.value.toString())"
              @mouseup="() => saveSettings()"
            />
          </div>
        </Disclosure>

        <!-- Node Settings -->
        <Disclosure title="Node" class="border-t border-border p-2">
          <div class="mt-2 mb-4 flex flex-col">
            <span class="text-sm font-light text-gray-300">Node Size</span>
            <div
              class="mt-2 box-border flex w-full cursor-pointer justify-between rounded-md border border-border"
              @click="
                () => {
                  if (connectionType !== 'Directory') {
                    nodeSize =
                      nodeSize === 'Connections' ? 'Lines' : 'Connections'
                    updateNodeSettings()
                  }
                }
              "
            >
              <div
                class="flex flex-1 justify-center py-1 px-2"
                :class="
                  nodeSize === 'Connections' ? 'text-white bg-primary' : ''
                "
              >
                <ConnectionIcon width="1.25rem" height="1.25rem" />
              </div>
              <div
                class="flex flex-1 justify-center py-1 px-2"
                :class="nodeSize === 'Lines' ? 'text-white bg-primary' : ''"
              >
                <LinesIcon width="1.25rem" height="1.25rem" />
              </div>
            </div>
          </div>
          <ToggleSwitch
            v-model="showNodeModules"
            label="Node Modules"
            @update:modelValue="() => updateNodeSettings()"
          />
          <ToggleSwitch
            v-model="showOrphans"
            label="Orphans"
            @update:modelValue="() => updateNodeSettings()"
          />
          <ToggleSwitch
            v-model="showLabels"
            label="Labels"
            @update:modelValue="() => updateNodeSettings()"
          />
          <ToggleSwitch
            v-model="showOutlines"
            label="Outlines"
            @update:modelValue="() => updateNodeSettings()"
          />
          <ToggleSwitch
            v-model="doCollisions"
            label="Collisions"
            @update:modelValue="() => updateNodeSettings()"
          />
        </Disclosure>

        <!-- Color Settings -->
        <Disclosure title="Colors" class="border-t border-border p-2">
          <!-- Color Switch -->
          <div class="mt-2 flex flex-col">
            <span class="text-sm font-light text-gray-300">Node Color</span>
            <div
              class="mt-2 box-border flex w-full cursor-pointer justify-between rounded-md border border-border"
              @click="
                () => {
                  nodeColor = nodeColor === 'D3' ? 'Random' : 'D3'
                  updateGraph()
                }
              "
            >
              <div
                class="flex flex-1 justify-center py-1 px-2"
                :class="nodeColor === 'D3' ? 'text-white bg-primary' : ''"
              >
                <LogoIcon width="1.25rem" height="1.25rem" />
              </div>
              <div
                class="flex flex-1 justify-center py-1 px-2"
                :class="nodeColor === 'Random' ? 'text-white bg-primary' : ''"
              >
                <RandomIcon width="1.25rem" height="1.25rem" />
              </div>
            </div>
          </div>

          <!-- D3 Colors -->
          <div v-if="nodeColor === 'D3'" class="mt-4 flex flex-col">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Popper from 'vue3-popper'

import type {
	Connection,
	Extension,
	Node,
	SliderInputEvent,
} from '../../utils/types'
import type { Ref } from 'vue'

import Disclosure from '../../components/Disclosure.vue'
import SliderRow from '../../components/SliderRow.vue'
import SliderRowIcon from '../../components/SliderRowIcon.vue'
import ToggleSwitch from '../../components/ToggleSwitch.vue'
import { drawD3Graph, updateD3Graph } from '../../utils/d3'
import { colorSchemes, getD3BackgroundColor } from '../../utils/d3ColorSchemes'
import { findMaxDepth } from '../../utils/findMaxDepth'
import {
	fetchSettings,
	getGraphData,
	setLanguageViewSettings,
	setSettings,
} from '../../utils/graphMessenger'
import { parseExtensions } from '../../utils/parseExtensions'

import SettingsIcon from '~icons/ant-design/setting-filled'
import LogoIcon from '~icons/logos/d3'
import CloseIcon from '~icons/mdi/close-circle'
import RandomIcon from '~icons/mdi/dice-multiple'
import DirectoryIcon from '~icons/mdi/folder'
import DepthGraphIcon from '~icons/mdi/graph'
import RestartIcon from '~icons/mdi/restart'
import LinesIcon from '~icons/mdi/text'
import ConnectionIcon from '~icons/mdi/transit-connection-variant'
import GraphIcon from '~icons/ph/graph'

let nodes: Ref<Node[]> = ref([])
let connections: Ref<Connection[]> = ref([])
let extensionList: Ref<Extension[]> = ref([])
let overrideExtensionColors: Ref<Record<string, string>[]> = ref([])
let currentOpenFile: Ref<string> = ref('')

let displaySettingsPopup: Ref<boolean> = ref(false)

// Display Settings
let connectionType: Ref<'Interaction' | 'Directory'> = ref('Interaction')
let nodeSize: Ref<'Connections' | 'Lines'> = ref('Lines')
let collapseFullPaths: Ref<string[]> = ref([])
let nodeColor: Ref<'D3' | 'Random'> = ref('D3')
let selectedD3Color: Ref<string> = ref('Spectral')

// D3 Settings
let nodeDepth: Ref<number> = ref(0)
let maxNodeDepth: Ref<number> = ref(0)
let chargeForce: Ref<number> = ref(-100)
let linkDistance: Ref<number> = ref(100)

// Extra Settings
let showNodeModules: Ref<boolean> = ref(false)
let showOrphans: Ref<boolean> = ref(false)
let showLabels: Ref<boolean> = ref(false)
let showOutlines: Ref<boolean> = ref(true)
let doCollisions: Ref<boolean> = ref(true)

onMounted(() => {
	fetchSettings()

	window.addEventListener('message', (event) => {
		const message = event.data // The JSON data our extension sent
		switch (message.command) {
		case 'setSettings':
			nodeColor.value = message.text.nodeColor
			selectedD3Color.value = message.text.selectedD3Color
			chargeForce.value = message.text.chargeForce
			linkDistance.value = message.text.linkDistance
			connectionType.value = message.text.connectionType
			nodeSize.value = message.text.nodeSize
			showNodeModules.value = message.text.showNodeModules
			showOrphans.value = message.text.showOrphans
			showLabels.value = message.text.showLabels
			showOutlines.value = message.text.showOutlines
			doCollisions.value = message.text.doCollisions

			updateNodeSettings()
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
				overrideExtensionColors: overrideExtensionColors.value,
				d3Color: selectedD3Color.value,
			})

			drawGraph()
			return
		case 'setCurrentFile':
			currentOpenFile.value = message.text
			updateD3Graph(nodes.value, extensionList.value, currentOpenFile.value)
			return
		case 'collapseNode':
			if (collapseFullPaths.value.indexOf(message.fullPath) !== -1) {
				collapseFullPaths.value.splice(
					collapseFullPaths.value.indexOf(message.fullPath),
					1,
				)
			} else {
				collapseFullPaths.value.push(message.fullPath)
			}

			updateNodeSettings()
			return
		case 'overrideExtensionColor':
			if (
				overrideExtensionColors.value.findIndex(
					(override) => override.name === message.override.extension,
				) !== -1
			) {
				overrideExtensionColors.value[
					overrideExtensionColors.value.findIndex(
						(override) => override.name === message.override.extension,
					)
				] = message.override
			} else {
				overrideExtensionColors.value.push(message.override)
			}

			extensionList.value = parseExtensions(nodes.value, {
				useRandomColor: nodeColor.value === 'Random',
				overrideExtensionColors: overrideExtensionColors.value,
				d3Color: selectedD3Color.value,
			})

			updateD3Graph(nodes.value, extensionList.value, currentOpenFile.value)
		}
	})
})

// Update the graph with new settings
const updateNodeSettings = () => {
	saveSettings()
	getGraphData({
		mode: connectionType.value,
		nodeSize: nodeSize.value,
		collapseFullPaths: collapseFullPaths.value,
		nodeDepth: nodeDepth.value,
		showNodeModules: showNodeModules.value,
		showOrphans: showOrphans.value,
	})
}

const drawGraph = () => {
	drawD3Graph({
		nodes: nodes.value,
		connections: connections.value,
		extensions: extensionList.value,
		currentOpenFile: currentOpenFile.value,
		showLabels: showLabels.value,
		showOutlines: showOutlines.value,
		doCollisions: doCollisions.value,
		chargeForce: chargeForce.value,
		linkDistance: linkDistance.value,
	})
}

const saveSettings = () => {
	setSettings({
		connectionType: connectionType.value,
		nodeSize: nodeSize.value,
		showNodeModules: showNodeModules.value,
		showOrphans: showOrphans.value,
		showLabels: showLabels.value,
		showOutlines: showOutlines.value,
		doCollisions: doCollisions.value,
		chargeForce: chargeForce.value,
		linkDistance: linkDistance.value,
		nodeColor: nodeColor.value,
		selectedD3Color: selectedD3Color.value,
	})
}

// Update the graph without regenerating the nodes / connections
const updateGraph = () => {
	saveSettings()
	setLanguageViewSettings({
		mode: connectionType.value,
		nodeColor: nodeColor.value,
		selectedD3Color: selectedD3Color.value,
	})

	extensionList.value = parseExtensions(nodes.value, {
		useRandomColor: nodeColor.value === 'Random',
		d3Color: selectedD3Color.value,
		overrideExtensionColors: overrideExtensionColors.value,
	})
	updateD3Graph(nodes.value, extensionList.value, currentOpenFile.value)
}
</script>
