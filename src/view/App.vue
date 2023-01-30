<template>
  <div class="flex flex-col max-w-[500px]">
    <!-- D3 Graph -->
    <svg
      width="500"
      height="500"
      class="container-border bg-zinc-900 overflow-hidden"
    />

    <!-- Tab Switch -->
    <div class="flex mt-4">
      <SwitchButton
        :options="['Languages', 'Settings']"
        :selected="activeTab"
        @update="(value) => activeTab = value"
      />
    </div>

    <!-- Language Tab Content -->
    <LanguageView
      v-show="activeTab === 'Languages'"
      class="mt-4"
      :extensionList="extensionList"
    />
    <!-- Settings Tab Content -->
    <SettingView
      v-show="activeTab === 'Settings'"
      class="mt-4"
      @resetGraph="resetGraph"
      @updateGraph="updateGraph"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import { drawD3Graph, updateD3Graph } from '../utils/d3'
import { parseExtensions } from '../utils/parseExtensions'
import type { Node, Connection, Extension, SettingsOptions } from '../utils/types'
import LanguageView from './components/LanguageView.vue'
import SettingView from './components/SettingView.vue'
import SwitchButton from './components/SwitchButton.vue'

let nodes: Ref<Node[] | undefined> = ref()
let connections: Ref<Connection[] | undefined> = ref()
let extensionList: Ref<Extension[]> = ref([])

let activeTab: Ref<string> = ref('Settings')

vscode.postMessage({
	command: 'getGraphData',
})

window.addEventListener('message', (event) => {
	const message = event.data // The JSON data our extension sent
	switch (message.command) {
	case 'setGraphData':
		nodes.value = message.text.nodes
		connections.value = message.text.connections

		if (nodes.value && connections.value) {
			extensionList.value = parseExtensions(nodes.value, { useRandomColor: false, d3Color: 'Turbo' })
			drawD3Graph(nodes.value, connections.value, extensionList.value)
		}
		return
	}
})

const resetGraph = () => {
	if (nodes.value && connections.value) {
		drawD3Graph(nodes.value, connections.value, extensionList.value)
	}
}

const updateGraph = (settingOptions: SettingsOptions) => {
	if (nodes.value && connections.value) {
		extensionList.value = parseExtensions(nodes.value, { useRandomColor: settingOptions.useRandomColor, d3Color: settingOptions.d3Color })
		updateD3Graph(nodes.value, extensionList.value)
	}
}
</script>
