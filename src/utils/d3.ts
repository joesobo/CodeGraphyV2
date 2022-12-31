import * as d3 from 'd3'
import type { Simulation, D3DragEvent } from 'd3'
import type { NodeDatum, ConnectionDatum, CustomSubject } from './types'

const colorScale = ['orange', 'lightblue', '#B19CD9']

// Create a new force guide diagram
const forceSimulation = d3.forceSimulation()
	.force('link', d3.forceLink())
	.force('charge', d3.forceManyBody().strength(-100))
	.force('center', d3.forceCenter())
	.force('collision', d3.forceCollide().radius((d: any) => { return d.radius }))

// drag
const drag = (simulation: Simulation<NodeDatum, undefined>) => {
	const dragstarted = (event: D3DragEvent<SVGCircleElement, NodeDatum, CustomSubject>) => {
		if (!event.active) simulation.alphaTarget(0.3).restart()
		event.subject.fx = event.subject.x
		event.subject.fy = event.subject.y
	}

	const dragged = (event: D3DragEvent<SVGCircleElement, NodeDatum, CustomSubject>) => {
		event.subject.fx = event.x
		event.subject.fy = event.y
	}

	const dragended = (event: D3DragEvent<SVGCircleElement, NodeDatum, CustomSubject>) => {
		if (!event.active) simulation.alphaTarget(0)
		event.subject.fx = null
		event.subject.fy = null
	}

	return d3.drag()
		.on('start', dragstarted)
		.on('drag', dragged)
		.on('end', dragended)
}

export const drawGraph = (nodes: NodeDatum[], connections: ConnectionDatum[]) => {
	const svg = d3.select('svg')
	const width: number = Number.parseInt(svg.attr('width'))
	const height: number = Number.parseInt(svg.attr('height'))
	const g = svg.append('g')

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
		.id((d: ConnectionDatum) => { return d.id })

	// Set drawing center location
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- d3 forceCenter is not typed
	// @ts-ignore
	forceSimulation.force('center').x(width / 2)
		.y(height / 2)

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
		.attr('r', (d: NodeDatum) => { return d.radius })
		.attr('fill', (d: NodeDatum) => {
			return colorScale[(d).category]
		})

	// Draw text
	gs.append('text')
		.attr('y', (d: NodeDatum) => -d.radius - 12)
		.attr('x', -5)
		.attr('dy', 10)
		.text((d: NodeDatum) => {
			return d.name
		})
}
