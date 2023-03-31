import * as d3 from 'd3'

import type {
	Connection,
	CustomSubject,
	Extension,
	Node,
	NodeSelection,
	NodeSimulation,
	SVGElement,
	SVGSelection,
} from './types'
import type { D3DragEvent, DragBehavior, Simulation } from 'd3'

import { getRandomIntSeed } from './basic'

export const drawD3Graph = ({
	nodes,
	connections,
	extensions,
	currentOpenFile,
}: {
  nodes: Node[]
  connections: Connection[]
  extensions: Extension[]
  currentOpenFile: string
}) => {
	if (nodes.length === 0 || connections.length === 0) return

	const svg = setupSVG('svg')
	const width = Number.parseInt(svg.attr('width'))
	const height = Number.parseInt(svg.attr('height'))

	const g = resetGraph(svg, nodes)

	const forceSimulation = initForceSimulation(width, height)
	addEventListeners(forceSimulation, width, height)

	const gCircles = drawNodes(
		forceSimulation,
		g,
		extensions,
		nodes,
		currentOpenFile,
	)
	gCircles.attr('transform', (d: Node) => {
		return `translate(${d.x}, ${d.y})`
	})
	drawLinks(forceSimulation, g, connections, nodes, gCircles)
	gCircles.raise()

	enableZoom(svg, g, width, height)

	return forceSimulation
}

const setupSVG = (selector: string): SVGElement => {
	const svg: SVGElement = d3.select<SVGSVGElement, unknown>(selector)

	return svg
}

const resetGraph = (svg: SVGElement, nodes: Node[]): SVGSelection => {
	document.querySelector('g')?.remove()

	const width: number = Number.parseInt(svg.attr('width'))
	const height: number = Number.parseInt(svg.attr('height'))

	nodes.forEach((node) => {
		node.x = getRandomIntSeed(node.fullPath, width)
		node.y = getRandomIntSeed(node.fullPath + node.name, height)
		node.vx = 0
		node.vy = 0
	})

	return svg.append<SVGGElement>('g')
}

const initForceSimulation = (width: number, height: number): NodeSimulation => {
	return d3
		.forceSimulation<Node, d3.SimulationLinkDatum<Node>>()
		.force(
			'link',
			d3.forceLink<Node, d3.SimulationLinkDatum<Node>>().distance(100),
		)
		.force(
			'charge',
			d3
				.forceManyBody<Node>()
				.strength(-10)
				.distanceMax(width / 2),
		)
		.force('center', d3.forceCenter(width / 2, height / 2))
		.force(
			'collision',
			d3.forceCollide<Node>().radius((d: Node) => {
				return d.radius
			}),
		)
}

const addEventListeners = (
	forceSimulation: NodeSimulation,
	width: number,
	height: number,
): void => {
	addForceChangeListener(forceSimulation, 'linkForce', d3.forceLink().strength)
	addForceChangeListener(
		forceSimulation,
		'linkDistance',
		d3.forceLink().distance,
	)
	addForceChangeListener(forceSimulation, 'chargeForce', (value) =>
		d3
			.forceManyBody()
			.strength(value)
			.distanceMax(width / 2),
	)
	addForceChangeListener(forceSimulation, 'centerForce', (value) =>
		d3.forceCenter(width / 2, height / 2).strength(value),
	)
}

const drawNodes = (
	forceSimulation: NodeSimulation,
	g: SVGSelection,
	extensions: Extension[],
	nodes: Node[],
	currentOpenFile: string,
): NodeSelection => {
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
		.on('dblclick', doubleClick)

	// Draw text
	gs.append('text')
		.attr('y', (d: Node) => -d.radius - 12)
		.attr('x', -5)
		.attr('dy', 10)
		.text((d: Node) => {
			return d.name
		})

	return gs
}

const drawLinks = (
	forceSimulation: NodeSimulation,
	g: SVGSelection,
	connections: Connection[],
	nodes: Node[],
	gCircles: NodeSelection,
) => {
	const links = g
		.append('g')
		.selectAll('line')
		.data(connections)
		.enter()
		.append('line')
		.attr('stroke', '#666')
		.attr('stroke-width', 1)

	const isNode = (node: Node | string | number): node is Node => {
		return typeof node !== 'string' && typeof node !== 'number'
	}

	const ticked = () => {
		links
			.attr('x1', (d: d3.SimulationLinkDatum<Node>) => {
				return isNode(d.source) && d.source.x ? d.source.x : 0
			})
			.attr('y1', (d: d3.SimulationLinkDatum<Node>) => {
				return isNode(d.source) && d.source.y ? d.source.y : 0
			})
			.attr('x2', (d: d3.SimulationLinkDatum<Node>) => {
				return isNode(d.target) && d.target.x ? d.target.x : 0
			})
			.attr('y2', (d: d3.SimulationLinkDatum<Node>) => {
				return isNode(d.target) && d.target.y ? d.target.y : 0
			})
		gCircles.attr('transform', (d: Node) => {
			return `translate(${d.x}, ${d.y})`
		})
	}

	// Generate node data
	forceSimulation.nodes(nodes).on('tick', ticked)

	// Generate line data
	const linkForce = forceSimulation.force('link') as d3.ForceLink<
    Node,
    d3.SimulationLinkDatum<Node>
  >
	linkForce.links(connections).id((d: Node) => {
		return d.id
	})
}

const enableZoom = (
	svg: SVGElement,
	g: SVGSelection,
	width: number,
	height: number,
) => {
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
}

export const updateD3Graph = (
	nodes: Node[],
	extensions: Extension[],
	currentOpenFile?: string,
) => {
	if (nodes.length === 0) return

	const svg = d3.select('svg')
	const circles = svg
		.selectAll<SVGCircleElement, Node>('circle')
		.data(nodes, (node: Node) => node.id)

	circles
		.enter()
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
	forceGenerator: (value: number) => any,
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

const drag = (
	simulation: Simulation<Node, undefined>,
): DragBehavior<SVGGElement, Node, CustomSubject> => {
	const dragstarted = (
		event: D3DragEvent<SVGGElement, Node, CustomSubject>,
	) => {
		if (!event.active) simulation.alphaTarget(0.3).restart()
		event.subject.fx = event.subject.x
		event.subject.fy = event.subject.y
	}

	const dragged = (event: D3DragEvent<SVGGElement, Node, CustomSubject>) => {
		event.subject.fx = event.x
		event.subject.fy = event.y
	}

	const dragended = (event: D3DragEvent<SVGGElement, Node, CustomSubject>) => {
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

const click = (
	_event: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
	d: Node,
) => {
	vscode.postMessage({
		command: 'collapseNode',
		text: d.id,
	})
}

const doubleClick = (
	_event: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
	d: Node,
) => {
	const path = d.fullPath
	vscode.postMessage({
		command: 'openFile',
		text: path,
	})
}
