import * as d3 from 'd3'

import type { Connection, CustomSubject, Extension, Node } from './types'
import type { D3DragEvent, Simulation } from 'd3'

import { getRandomInt } from './basic'

// drag
const drag = (simulation: Simulation<Node, undefined>) => {
	const dragstarted = (event: D3DragEvent<SVGCircleElement, Node, CustomSubject>) => {
		if (!event.active) simulation.alphaTarget(0.3).restart()
		event.subject.fx = event.subject.x
		event.subject.fy = event.subject.y
	}

	const dragged = (event: D3DragEvent<SVGCircleElement, Node, CustomSubject>) => {
		event.subject.fx = event.x
		event.subject.fy = event.y
	}

	const dragended = (event: D3DragEvent<SVGCircleElement, Node, CustomSubject>) => {
		if (!event.active) simulation.alphaTarget(0)
		event.subject.fx = null
		event.subject.fy = null
	}

	return d3.drag()
		.on('start', dragstarted)
		.on('drag', dragged)
		.on('end', dragended)
}

export const drawD3Graph = (nodes: Node[], connections: Connection[], extensions: Extension[]) => {
	// Select svg
	const svg = d3.select('svg')
	const width: number = Number.parseInt(svg.attr('width'))
	const height: number = Number.parseInt(svg.attr('height'))

	// Reset graph, node placement, and scale
	document.querySelector('g')?.remove()
	nodes.forEach((node) => {
		node.x = getRandomInt(width)
		node.y = getRandomInt(height)
		node.vx = 0
		node.vy = 0
	})
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- d3.select not properly typed
	// @ts-ignore
	d3.zoom().transform(svg, d3.zoomIdentity)

	// Setup
	const g = svg.append('g')

	// Force simulation
	const forceSimulation = d3.forceSimulation()
		.force('link', d3.forceLink().distance(100))
		.force('charge', d3.forceManyBody().strength(-10).distanceMax(width / 2))
		.force('center', d3.forceCenter(width / 2, height / 2))
		.force('collision', d3.forceCollide().radius((d: any) => { return d.radius }))

	document.querySelector('#linkForce')?.addEventListener('change', (event) => {
		const inputElement = event.target as HTMLInputElement
		const value = Number.parseInt(inputElement.value)
		forceSimulation.force('link', null)
		forceSimulation.force('link', d3.forceLink().strength(value))
	})

	document.querySelector('#linkDistance')?.addEventListener('change', (event) => {
		const inputElement = event.target as HTMLInputElement
		const value = Number.parseInt(inputElement.value)
		forceSimulation.force('link', null)
		forceSimulation.force('link', d3.forceLink().distance(value))
	})

	document.querySelector('#chargeForce')?.addEventListener('change', (event) => {
		const inputElement = event.target as HTMLInputElement
		const value = Number.parseInt(inputElement.value)
		forceSimulation.force('charge', null)
		forceSimulation.force('charge', d3.forceManyBody().strength(value).distanceMax(width / 2))
	})

	document.querySelector('#centerForce')?.addEventListener('change', (event) => {
		const inputElement = event.target as HTMLInputElement
		const value = Number.parseInt(inputElement.value)
		forceSimulation.force('center', null)
		forceSimulation.force('center', d3.forceCenter(width / 2, height / 2).strength(value))
	})

	// Zoom
	const zoom = d3.zoom()
		.scaleExtent([0.1, 10])
		.translateExtent([[-width * 15, -height * 15], [width * 15, height * 15]])
		.on('zoom', (event) => { g.attr('transform', event.transform) })

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- d3 zoom is not typed
	// @ts-ignore
	svg.call(zoom)

	// Draw side
	const links = g.append('g')
		.selectAll('line')
		.data(connections)
		.enter()
		.append('line')
		.attr('stroke', '#666')
		.attr('stroke-width', 1)

	// ticked
	const ticked = () => {
		links
			.attr('x1', (d: any) => { return d.source.x })
			.attr('y1', (d: any) => { return d.source.y })
			.attr('x2', (d: any) => { return d.target.x })
			.attr('y2', (d: any) => { return d.target.y })
		gs
			.attr('transform', (d: any) => { return `translate(${d.x}, ${d.y})` })
	}

	// Generate node data
	forceSimulation.nodes(nodes)
		.on('tick', ticked)

	// Generate side data
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- d3 forceLink is not typed
	// @ts-ignore
	forceSimulation.force('link').links(connections)
		.id((d: Connection) => { return d.id })

	// Create group
	const gs = g.selectAll('.circleText')
		.data(nodes)
		.enter()
		.append('g')
		.attr('class', 'fill-white')
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- drag is not typed
		// @ts-ignore
		.call(drag(forceSimulation))

	// Draw node
	gs.append('circle')
		.attr('r', (d: Node) => { return d.radius })
		.attr('fill', (d: Node) => {
			// find extension color to match nodes extension
			let nodeExt = ''
			if (d.name.startsWith('.')) {
				nodeExt = d.name.substring(1).split('.').slice(1).join('.')
			} else {
				nodeExt = d.name.split('.').slice(1).join('.')
			}

			return extensions.find((ext) => { return ext.extension === nodeExt })?.color ?? '#000'
		})

	// Draw text
	gs.append('text')
		.attr('y', (d: Node) => -d.radius - 12)
		.attr('x', -5)
		.attr('dy', 10)
		.text((d: Node) => {
			return d.name
		})
	return forceSimulation
}

export const updateD3Graph = (nodes: Node[], extensions: Extension[]) => {
	const svg = d3.select('svg')
	const selection = svg.selectAll('circle')

	let index = 0
	for (const element of selection) {
		const node = nodes[index]

		let nodeExt = ''
		if (node.name.startsWith('.')) {
			nodeExt = node.name.substring(1).split('.').slice(1).join('.')
		} else {
			nodeExt = node.name.split('.').slice(1).join('.')
		}

		(element as Element).setAttribute('fill', extensions.find((ext) => { return ext.extension === nodeExt })?.color ?? '#000')

		index++
	}
}
