import type { Connection, File, Node, UnprocessedNode } from './types'

import { getRandomInt } from './basic'
import { isFavorite } from './favoriteFile'

const MIN_RADIUS = 10
const MAX_RADIUS = 25

export const getNodes = (
	unprocessedNodes: UnprocessedNode[],
	connections: Connection[],
	nodeSize: 'Lines' | 'Connections',
) => {
	const nodes: Node[] = []

	unprocessedNodes.forEach((unprocessedNode, index) => {
		const nodePath = unprocessedNode.data.name.replace(/\\/g, '/')
		let nodeName = nodePath.split('/').pop() || ''

		if (unprocessedNode.type === 'Package') {
			nodeName = nodePath.split('node_modules/')?.pop() || ''
		}

		const node: Node = {
			id: index,
			name: nodeName,
			fullPath: unprocessedNode.data.name,
			radius: getNodeSize(unprocessedNodes, connections, nodeSize, index),
			depth: -1,
			collapsed: false,
			hidden: false,
			type: unprocessedNode.type,
		}

		if (unprocessedNode.type === 'File') {
			node.lines = (unprocessedNode.data as File).lines
			node.favorite = isFavorite(unprocessedNode.data.name)
		}

		nodes.push(node)
	})

	return nodes
}

// Find the Radius for the Node based on settings
const getNodeSize = (
	unprocessedNodes: UnprocessedNode[],
	connections: Connection[],
	nodeSize: string,
	index: number,
) => {
	const unprocessedNode = unprocessedNodes[index]

	if (unprocessedNode.type !== 'File') return MIN_RADIUS
	const file: File = unprocessedNode.data as File

	const MAX_LINES = getMaxLines(unprocessedNodes)
	const MAX_CONNECTIONS = getMaxConnections(connections)

	let radius = getRandomInt(15) + 10

	if (nodeSize === 'Lines') {
		radius = MIN_RADIUS + ((MAX_RADIUS - MIN_RADIUS) * file.lines) / MAX_LINES
	} else if (nodeSize === 'Connections') {
		let connectionCount = 0

		connections.forEach((connection) => {
			const regex = /(\d+)-(\d+)/
			const match = connection.id.match(regex)

			if (match) {
				const sourceId = Number.parseInt(match[1])
				const targetId = Number.parseInt(match[2])
				if (sourceId === index || targetId === index) {
					connectionCount++
				}
			}
		})

		radius =
      MIN_RADIUS +
      ((MAX_RADIUS - MIN_RADIUS) * connectionCount) / MAX_CONNECTIONS
	}

	return radius
}

// Find the most lines in a file
const getMaxLines = (unprocessedNodes: UnprocessedNode[]) => {
	let MAX_LINES = 0
	unprocessedNodes.forEach((unprocessedNode) => {
		if (unprocessedNode.type !== 'File') return
		const file: File = unprocessedNode.data as File

		if (file.lines > MAX_LINES) {
			MAX_LINES = file.lines
		}
	})
	return MAX_LINES
}

// Find the most connections in a file
const getMaxConnections = (connections: Connection[]) => {
	const connectionMap: number[] = []

	connections.forEach((connection) => {
		connectionMap[connection.source] = connectionMap[connection.source] + 1 || 1
		connectionMap[connection.target] = connectionMap[connection.target] + 1 || 1
	})

	let MAX_CONNECTIONS = 0
	connectionMap.forEach((value) => {
		if (value > MAX_CONNECTIONS) {
			MAX_CONNECTIONS = value
		}
	})

	return MAX_CONNECTIONS
}
