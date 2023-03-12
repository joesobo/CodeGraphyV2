import * as d3 from 'd3'
import { D3DragEvent, DragBehavior, Simulation } from 'd3'

import { getRandomInt } from './basic'
import type { Connection, CustomSubject, Extension, Node, NodeSimulation, SVGElement } from './types'

export const drawD3Graph = (
	nodes: Node[] | undefined,
	connections: Connection[] | undefined,
	extensions: Extension[],
	currentOpenFile?: string
) => {
	if (!nodes || !connections) return

	// Select svg
	const svg: SVGElement = d3.select<SVGSVGElement, unknown>('svg')
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

	// Setup
	const g = svg.append<SVGGElement>('g')

	// Draw links
	const links = g
		.append('g')
		.selectAll('line')
		.data(connections)
		.enter()
		.append('line')
		.attr('stroke', '#666')
		.attr('stroke-width', 1)

	// Force simulation
	const forceSimulation: NodeSimulation = d3
		.forceSimulation<Node, d3.SimulationLinkDatum<Node>>()
		.force('link', d3.forceLink<Node, d3.SimulationLinkDatum<Node>>().distance(100))
		.force(
			'charge',
			d3
				.forceManyBody<Node>()
				.strength(-10)
				.distanceMax(width / 2)
		)
		.force('center', d3.forceCenter(width / 2, height / 2))
		.force(
			'collision',
			d3.forceCollide<Node>().radius((d: Node) => {
				return d.radius
			})
		)

	// Force Setting Listeners
	addForceChangeListener(forceSimulation, 'linkForce', d3.forceLink().strength)
	addForceChangeListener(forceSimulation, 'linkDistance', d3.forceLink().distance)
	addForceChangeListener(
		forceSimulation, 'chargeForce',
		(value) =>
			d3.forceManyBody().strength(value).distanceMax(width / 2)
	)
	addForceChangeListener(
		forceSimulation, 'centerForce',
		(value) => d3.forceCenter(width / 2, height / 2).strength(value)
	)

	// Zoom
	const zoom = d3
		.zoom<SVGSVGElement, unknown>()
		.scaleExtent([0.1, 10])
		.translateExtent([
			[-width * 15, -height * 15],
			[width * 15, height * 15],
		])
		.on('zoom', (event) => {
			g.attr('transform', event.transform)
		})

	svg.call(zoom).call(zoom.transform, d3.zoomIdentity)

	// ticked
	const ticked = () => {
		links
			.attr('x1', (d: any) => {
				return d.source.x
			})
			.attr('y1', (d: any) => {
				return d.source.y
			})
			.attr('x2', (d: any) => {
				return d.target.x
			})
			.attr('y2', (d: any) => {
				return d.target.y
			})
		gs.attr('transform', (d: Node) => {
			return `translate(${d.x}, ${d.y})`
		})
	}

	// Generate node data
	forceSimulation.nodes(nodes).on('tick', ticked)

	// Generate line data
	forceSimulation
		.force('link')
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- d3 forceLink is not typed
		// @ts-ignore
		?.links(connections)
		.id((d: Connection) => {
			return d.id
		})

	// Create group
	const gs = g
		.selectAll('.circleText')
		.data(nodes)
		.enter()
		.append('g')
		.attr('class', 'fill-white')
		.call(drag(forceSimulation))

	// Draw node
	gs.append('circle')
		.attr('r', (d: Node) => {
			return d.radius
		})
		.attr('fill', (d: Node) => {
			// find extension color to match nodes extension
			let nodeExt = ''
			if (d.name.startsWith('.')) {
				nodeExt = d.name.substring(1).split('.').slice(1).join('.')
			} else {
				nodeExt = d.name.split('.').slice(1).join('.')
			}

			if (d.fullPath === currentOpenFile) {
				return '#fff'
			}

			return (
				extensions.find((ext) => {
					return ext.extension === nodeExt
				})?.color ?? '#000'
			)
		})

		.on('click', click)

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

export const updateD3Graph = (nodes: Node[] | undefined, extensions: Extension[], currentOpenFile?: string) => {
	if (!nodes) return

	const svg = d3.select('svg')
	const circles = svg.selectAll<SVGCircleElement, Node>('circle').data(nodes, (node: Node) => node.id)

	circles.enter()
		.append('circle')
		.attr('r', (node: Node) => node.radius)

	circles.exit().remove()

	circles.attr('fill', (node: Node) => {
		let color = '#000'
		const nodeExt = node.name.startsWith('.')
			? node.name.substring(1).split('.').slice(1).join('.')
			: node.name.split('.').slice(1).join('.')
		color = extensions.find((ext) => ext.extension === nodeExt)?.color ?? '#000'

		if (node.fullPath === currentOpenFile) {
			return '#fff'
		}

		return color
	})
}

const addForceChangeListener = (
	forceSimulation: NodeSimulation,
	forceName: string,
	forceGenerator: (value: number) => any
) => {
	const element = document.querySelector(`#${forceName}`) as HTMLInputElement
	if (element) {
		element.addEventListener('change', (event) => {
			const inputElement = event.target as HTMLInputElement
			const value = Number.parseInt(inputElement.value)
			forceSimulation.force(forceName, null)
			forceSimulation.force(forceName, forceGenerator(value))
		})
	}
}

const drag = (simulation: Simulation<Node, undefined>): DragBehavior<SVGGElement, Node, CustomSubject> => {
	const dragstarted = (
		event: D3DragEvent<SVGGElement, Node, CustomSubject>
	) => {
		if (!event.active) simulation.alphaTarget(0.3).restart()
		event.subject.fx = event.subject.x
		event.subject.fy = event.subject.y
	}

	const dragged = (
		event: D3DragEvent<SVGGElement, Node, CustomSubject>
	) => {
		event.subject.fx = event.x
		event.subject.fy = event.y
	}

	const dragended = (
		event: D3DragEvent<SVGGElement, Node, CustomSubject>
	) => {
		if (!event.active) simulation.alphaTarget(0)
		event.subject.fx = null
		event.subject.fy = null
	}

	return d3
		.drag<SVGGElement, Node, CustomSubject>()
		.on('start', dragstarted)
		.on('drag', dragged)
		.on('end', dragended)
}

const click = (_event: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, d: Node) => {
	const path = d.fullPath
	vscode.postMessage({
		command: 'openFile',
		text: path
	})
}
