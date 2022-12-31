<template>
  <div class="bg-zinc-900 overflow-hidden">
    <svg
      width="600"
      height="600"
      class="container-border"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { drawGraph } from '../utils/d3'

let nodes = ref()
let connections = ref()

window.addEventListener('message', (event) => {
	const message = event.data // The JSON data our extension sent
	switch (message.command) {
	case 'setGraphData':
		nodes.value = message.text.nodes
		connections.value = message.text.connections
		drawGraph(nodes.value, connections.value)
		return
	}
})

vscode.postMessage({
	command: 'getGraphData',
})
</script>
