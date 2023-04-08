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
import type {
	D3DragEvent,
	DragBehavior,
	Simulation,
	SimulationLinkDatum,
} from 'd3'

import { getRandomIntSeed } from './basic'
import { collapseNodes } from './collapseNodes'

const MIN_DISTANCE = 0
let MAX_DISTANCE = 250
const MAX_RADIUS = 25

export const drawD3Graph = ({
	nodes,
	connections,
	extensions,
	currentOpenFile,
	showLabels,
	showOutlines,
	doCollisions,
	chargeForce,
	linkDistance,
}: {
  nodes: Node[]
  connections: Connection[]
  extensions: Extension[]
  currentOpenFile: string
  showLabels: boolean
  showOutlines: boolean
  doCollisions: boolean
  chargeForce: number
  linkDistance: number
}) => {
	if (nodes.length === 0) return

	const svg = setupSVG('svg')
	const width = Number.parseInt(svg.attr('width'))
	const height = Number.parseInt(svg.attr('height'))

	const g = resetGraph(svg, nodes)

	const forceSimulation = initForceSimulation(
		width,
		height,
		doCollisions,
		chargeForce,
		linkDistance,
	)
	addEventListeners(forceSimulation, width)

	const gCircles = drawNodes(
		forceSimulation,
		g,
		extensions,
		nodes,
		connections,
		currentOpenFile,
		showLabels,
		showOutlines,
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

const initForceSimulation = (
	width: number,
	height: number,
	doCollisions: boolean,
	chargeForce: number,
	linkDistance: number,
): NodeSimulation => {
	MAX_DISTANCE = linkDistance
	const forceSimulation = d3
		.forceSimulation<Node, d3.SimulationLinkDatum<Node>>()
		.force(
			'link',
			d3.forceLink<Node, d3.SimulationLinkDatum<Node>>().distance(0),
		)
		.force(
			'charge',
			d3
				.forceManyBody<Node>()
				.strength(chargeForce)
				.distanceMax(width / 2),
		)
		.force('center', d3.forceCenter(width / 2, height / 2))

	if (doCollisions) {
		forceSimulation.force(
			'collision',
			d3.forceCollide<Node>().radius((d: Node) => {
				return d.radius
			}),
		)
	}

	return forceSimulation
}

const addEventListeners = (
	forceSimulation: NodeSimulation,
	width: number,
): void => {
	addForceChangeListener(
		forceSimulation,
		'link',
		(value) => (MAX_DISTANCE = value),
	)
	addForceChangeListener(forceSimulation, 'chargeForce', (value) =>
		d3
			.forceManyBody()
			.strength(value)
			.distanceMax(width / 2),
	)
}

const drawNodes = (
	forceSimulation: NodeSimulation,
	g: SVGSelection,
	extensions: Extension[],
	nodes: Node[],
	connections: Connection[],
	currentOpenFile: string,
	showLabels: boolean,
	showOutlines: boolean,
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
		.attr('r', (d: Node) => d.radius)
		.attr('fill', (d: Node) => getNodeColor(d, extensions, currentOpenFile))
		.attr('stroke', (d) => (d.collapsed && showOutlines ? '#ffd700' : ''))
		.attr('stroke-width', (d) => (d.collapsed && showOutlines ? 4 : 0))
		.on('click', click)
		.on('mouseover', handleMouseOver(gs, currentOpenFile, nodes, connections))
		.on('mouseout', handleMouseOut(gs))

	// Draw text
	if (showLabels) {
		gs.append('text')
			.attr('y', (d: Node) => -d.radius - 12)
			.attr('x', -5)
			.attr('dy', 10)
			.text((d: Node) => {
				return d.name
			})
	}

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
	linkForce
		.links(connections)
		.id((d: Node) => {
			return d.id
		})
		.distance((link: SimulationLinkDatum<Node>) => {
			const source = link.source as Node
			const target = link.target as Node

			const largestRadius = Math.max(source.radius, target.radius)

			return (
				MIN_DISTANCE +
        ((MAX_DISTANCE - MIN_DISTANCE) * largestRadius) / MAX_RADIUS
			)
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
	currentOpenFile: string,
) => {
	if (nodes.length === 0) return

	const svg = d3.select('svg')
	const circles = svg.selectAll<SVGCircleElement, Node>('circle')

	circles
		.enter()
		.append('circle')
		.attr('r', (node: Node) => node.radius)

	circles.exit().remove()

	circles.attr('fill', (node: Node) =>
		getNodeColor(node, extensions, currentOpenFile),
	)
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

const click = (event: MouseEvent, d: Node) => {
	if (event.shiftKey) {
		vscode.postMessage({
			command: 'collapseNode',
			text: d.fullPath,
		})
	} else {
		const path = d.fullPath
		vscode.postMessage({
			command: 'openFile',
			text: path,
		})
	}
}

const handleMouseOver =
  (
  	gs: NodeSelection,
  	currentOpenFile: string,
  	nodes: Node[],
  	connections: Connection[],
  ) =>
  	(event: MouseEvent, d: Node) => {
  		if (event.shiftKey) {
  			const activeNode = gs
  				.filter((node) => node.fullPath === currentOpenFile)
  				.datum() as Node
  			const collapsedNodes = collapseNodes({
  				activeId: activeNode.id,
  				collapseIds: [d.id],
  				nodes: nodes.map((node) => ({
  					...node,
  					hidden: false,
  					collapsed: false,
  				})),
  				connections,
  			})

  			const collapsedIds = collapsedNodes
  				.filter((node) => node.hidden)
  				.map((node) => node.id)

  			gs.filter((node) => collapsedIds.includes(node.id)).attr('opacity', '0.3')
  		}
  	}

const handleMouseOut =
  (gs: NodeSelection) => (_event: MouseEvent, _d: Node) => {
  	gs.attr('opacity', 1)
  }

const getNodeColor = (
	node: Node,
	extensions: Extension[],
	currentOpenFile: string,
): string => {
	if (node.fullPath === currentOpenFile) {
		return '#fff'
	}

	let nodeExt = `.${
		node.name.startsWith('.')
			? node.name.substring(1).split('.').slice(1).join('.')
			: node.name.split('.').slice(1).join('.')
	}`
	if (nodeExt === '.') {
		nodeExt = 'Directory'
	}

	return extensions.find((ext) => ext.extension === nodeExt)?.color ?? '#000'
}
