<!-- eslint-disable vue/html-self-closing -->
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
import * as d3 from 'd3'
import { onMounted } from 'vue'

const getRandomInt = (max) => {
	max = Math.floor(max)
	return Math.floor(Math.random() * max)
}

const colorScale = ['orange', 'lightblue', '#B19CD9']
// Node Dataset
let nodes = [
	{ name: '1', radius: Math.random() * 15 + 10, category: getRandomInt(3) },
	{ name: '2', radius: Math.random() * 15 + 10, category: getRandomInt(3) },
	{ name: '3', radius: Math.random() * 15 + 10, category: getRandomInt(3) },
	{ name: '4', radius: Math.random() * 15 + 10, category: getRandomInt(3) },
	{ name: '5', radius: Math.random() * 15 + 10, category: getRandomInt(3) },
	{ name: '6', radius: Math.random() * 15 + 10, category: getRandomInt(3) },
	{ name: '7', radius: Math.random() * 15 + 10, category: getRandomInt(3) },
	{ name: '8', radius: Math.random() * 15 + 10, category: getRandomInt(3) },
	{ name: '9', radius: Math.random() * 15 + 10, category: getRandomInt(3) }
]
// Side Dataset
let edges = [
	{ source: getRandomInt(nodes.length), target: getRandomInt(nodes.length) },
	{ source: getRandomInt(nodes.length), target: getRandomInt(nodes.length) },
	{ source: getRandomInt(nodes.length), target: getRandomInt(nodes.length) },
	{ source: getRandomInt(nodes.length), target: getRandomInt(nodes.length) },
	{ source: getRandomInt(nodes.length), target: getRandomInt(nodes.length) },
	{ source: getRandomInt(nodes.length), target: getRandomInt(nodes.length) },
	{ source: getRandomInt(nodes.length), target: getRandomInt(nodes.length) },
	{ source: getRandomInt(nodes.length), target: getRandomInt(nodes.length) },
	{ source: getRandomInt(nodes.length), target: getRandomInt(nodes.length) },
	{ source: getRandomInt(nodes.length), target: getRandomInt(nodes.length) }
]

// Create a new force guide diagram
let forceSimulation = d3.forceSimulation()
	.force('link', d3.forceLink())
	.force('charge', d3.forceManyBody().strength(-1000))
	.force('center', d3.forceCenter())
	.force('collision', d3.forceCollide().radius((d) => { return d.radius }))

// drag
const drag = (simulation) => {
	const dragstarted = (event) => {
		if (!event.active) simulation.alphaTarget(0.3).restart()
		event.subject.fx = event.subject.x
		event.subject.fy = event.subject.y
	}

	const dragged = (event) => {
		event.subject.fx = event.x
		event.subject.fy = event.y
	}

	const dragended = (event) => {
		if (!event.active) simulation.alphaTarget(0)
		event.subject.fx = null
		event.subject.fy = null
	}

	return d3.drag()
		.on('start', dragstarted)
		.on('drag', dragged)
		.on('end', dragended)
}

onMounted(() => {
	let svg = d3.select('svg')
	let width = svg.attr('width')
	let height = svg.attr('height')
	let g = svg.append('g')

	// Zoom
	const handleZoom = (event) => {
		g.attr('transform', event.transform)
	}

	let zoom = d3.zoom()
		.scaleExtent([0.1, 10])
		.on('zoom', handleZoom)

	svg.call(zoom)

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

	// Create group
	let gs = g.selectAll('.circleText')
		.data(nodes)
		.enter()
		.append('g')
		.attr('class', 'fill-white')
		.call(drag(forceSimulation))

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
