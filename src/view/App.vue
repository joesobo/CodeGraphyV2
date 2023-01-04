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
        @update="(value) => activeTab = value"
      />
    </div>

    <!-- Language Tab Content -->
    <div
      v-if="activeTab === 'Languages'"
      class="mt-4"
    >
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
          <tr class="bg-zinc-800 border border-zinc-700">
            <td class="pl-2">
              TypeScript
            </td>
            <td>.ts</td>
            <td>10</td>
            <td>100</td>
            <td>
              <div class="w-4 h-4 bg-blue-500 rounded-full border border-white cursor-pointer" />
            </td>
            <td>
              <button class="text-red-500 bg-transparent hover:background-white w-4 h-4 rounded-full">
                <CloseIcon class="w-4 h-4" />
              </button>
            </td>
          </tr>
          <tr class="bg-zinc-800 border border-zinc-700">
            <td class="pl-2">
              JavaScript
            </td>
            <td>.js</td>
            <td>3</td>
            <td>24</td>
            <td>
              <div class="w-4 h-4 bg-blue-500 rounded-full border border-white cursor-pointer" />
            </td>
            <td>
              <button class="text-red-500 bg-transparent hover:background-white w-4 h-4 rounded-full">
                <CloseIcon class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Settings Tab Content -->
    <div
      v-else-if="activeTab === 'Settings'"
      class="mt-4 flex flex-col"
    >
      <div class="flex mt-4 items-center">
        <label class="w-1/3">Connection</label>
        <div class="flex w-2/3">
          <SwitchButton :options="['Interaction', 'Directory']" />
        </div>
      </div>
      <div class="flex mt-4 items-center">
        <label class="w-1/3">Display</label>
        <div class="flex w-2/3">
          <SwitchButton :options="['Graph', 'Local']" />
        </div>
      </div>
      <div class="flex mt-4 items-center">
        <label class="w-1/3">Node Size</label>
        <div class="flex w-2/3">
          <SwitchButton :options="['Connections', 'Lines', 'Views']" />
        </div>
      </div>
      <div class="mt-4">
        <Disclosure
          title="D3"
        >
          <div class="flex flex-col ml-auto w-2/3">
            <SliderRow
              :value="centerForce"
              label="Center Force"
              @input="event => centerForce = event.target.value"
            />
            <SliderRow
              :value="repelForce"
              label="Repel Force"
              @input="event => repelForce = event.target.value"
            />
            <SliderRow
              :value="linkForce"
              label="Link Force"
              @input="event => linkForce = event.target.value"
            />
            <SliderRow
              :value="linkDistance"
              label="Link Distance"
              @input="event => linkDistance = event.target.value"
            />
          </div>
        </Disclosure>
      </div>
      <div class="mt-4">
        <Disclosure
          title="Extra"
        >
          <div class="flex flex-col w-2/3 ml-auto mt-2">
            <switch>Hide Orphans</switch>
            <switch>Hide Labels</switch>
            <div>Line width</div>
            <div>Line color</div>
            <switch>Node outline</switch>
          </div>
        </Disclosure>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import CloseIcon from '~icons/mdi/close-circle'
import { drawGraph } from '../utils/d3'
import type { Node, Connection } from '../utils/types'
import SliderRow from './components/SliderRow.vue'
import SwitchButton from './components/SwitchButton.vue'
import Disclosure from './components/Disclosure.vue'

let nodes: Ref<Node[] | undefined> = ref()
let connections: Ref<Connection[] | undefined> = ref()

let activeTab: Ref<string> = ref('Languages')

let centerForce: Ref<number> = ref(25)
let repelForce: Ref<number> = ref(25)
let linkForce: Ref<number> = ref(25)
let linkDistance: Ref<number> = ref(25)

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
			drawGraph(nodes.value, connections.value)
		}
		return
	}
})
</script>
