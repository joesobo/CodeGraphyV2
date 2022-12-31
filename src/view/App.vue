<template>
  <div class="flex flex-col">
    <svg
      width="500"
      height="500"
      class="container-border bg-zinc-900 overflow-hidden"
    />

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
      id="linkForceElement"
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { drawGraph } from '../utils/d3'
import SliderRow from './components/SliderRow.vue'
import type { Ref } from 'vue'
import type { NodeDatum, ConnectionDatum } from '../utils/types'

let nodes: Ref<NodeDatum[] | undefined> = ref()
let connections: Ref<ConnectionDatum[] | undefined> = ref()
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
