<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="bg-zinc-900">
    <svg
      width="600"
      height="600"
      class="container-border"
    />
  </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3'
import { onMounted } from 'vue'

onMounted(() => {
	let svg = d3.select('svg')
	let width = svg.attr('width')
	let height = svg.attr('height')
	let g = svg.append('g')

	const colorScale = ['orange', 'lightblue', '#B19CD9']
	// Node Dataset
	let nodes = [
		{ name: '1', radius: Math.random() * 15 + 10, category: 0 },
		{ name: '2', radius: Math.random() * 15 + 10, category: 0 },
		{ name: '3', radius: Math.random() * 15 + 10, category: 0 },
		{ name: '4', radius: Math.random() * 15 + 10, category: 1 },
		{ name: '5', radius: Math.random() * 15 + 10, category: 2 },
		{ name: '6', radius: Math.random() * 15 + 10, category: 1 },
		{ name: '7', radius: Math.random() * 15 + 10, category: 1 },
		{ name: '8', radius: Math.random() * 15 + 10, category: 2 },
		{ name: '9', radius: Math.random() * 15 + 10, category: 2 }
	]
	// Side Dataset
	let edges = [
		{ source: 0, target: 4 },
		{ source: 4, target: 5 },
		{ source: 4, target: 6 },
		{ source: 4, target: 7 },
		{ source: 1, target: 6 },
		{ source: 2, target: 5 },
		{ source: 3, target: 7 },
		{ source: 5, target: 6 },
		{ source: 6, target: 7 },
		{ source: 6, target: 8 }
	]

	// Draw side
	let links = g.append('g')
		.selectAll('line')
		.data(edges)
		.enter()
		.append('line')
		.attr('stroke', '#666')
		.attr('stroke-width', 1)

	// ticked
	const ticked = () => {
		links
			.attr('x1', (d) => { return d.source.x })
			.attr('y1', (d) => { return d.source.y })
			.attr('x2', (d) => { return d.target.x })
			.attr('y2', (d) => { return d.target.y })
		gs
			.attr('transform', (d) => { return `translate(${d.x}, ${d.y})` })
	}

	// Create a new force guide diagram
	let forceSimulation = d3.forceSimulation()
		.force('link', d3.forceLink())
		.force('charge', d3.forceManyBody().strength(-1000))
		.force('center', d3.forceCenter())
		.force('collision', d3.forceCollide().radius((d) => { return d.radius }))

	// Generate node data
	forceSimulation.nodes(nodes)
		.on('tick', ticked)

	// Generate side data
	forceSimulation.force('link')
		.links(edges)
		.id((d) => { return d.id })

	// Set drawing center location
	forceSimulation.force('center')
		.x(width / 2)
		.y(height / 2)

	// drag
	const started = (d) => {
		if (!d3.event.active) {
			forceSimulation.alphaTarget(0.8).restart() // Set the attenuation coefficient to simulate the node position movement process. The higher the value, the faster the movement. The value range is [0, 1]
		}
		d.fx = d.x
		d.fy = d.y
	}
	const dragged = (d) => {
		d.fx = d3.event.x
		d.fy = d3.event.y
	}
	const ended = (d) => {
		if (!d3.event.active) {
			forceSimulation.alphaTarget(0)
		}
		d.fx = null
		d.fy = null
	}

	// Create group
	let gs = g.selectAll('.circleText')
		.data(nodes)
		.enter()
		.append('g')
		.attr('transform', (d) => {
			return `translate(${d.x}, ${d.y})`
		})
		.attr('class', 'fill-white')
		.call(d3.drag()
			.on('start', started)
			.on('drag', dragged)
			.on('end', ended)
		)

	// Draw node
	gs.append('circle')
		.attr('r', (d) => { return d.radius })
		.attr('fill', (d) => {
			return colorScale[d.category]
		})

	// Draw text
	gs.append('text')
		.attr('y', (d) => -d.radius - 12)
		.attr('x', -5)
		.attr('dy', 10)
		.text((d) => {
			return d.name
		})
})
</script>
