import type { Connection, File, Node } from './types'

import { getRandomInt } from './basic'

const MIN_RADIUS = 10
const MAX_RADIUS = 25

export const processData = (
	files: File[],
	nodeSize: string,
	connections: Connection[]
) => {
	const nodes: Node[] = []
	const tempFiles: File[] = files

	const MAX_LINES = getMaxLines(tempFiles)
	const MAX_CONNECTIONS = getMaxConnections(connections)

	// push root nodes
	for (let index = 0; index < tempFiles.length; index++) {
		const file = tempFiles[index]
		const filePath = file.name.replace(/\\/g, '/')
		const fileName = filePath.split('/').pop() || ''

		// Find the Radius for the Node based on settings
		let radius = getRandomInt(15) + 10

		if (nodeSize === 'Lines') {
			radius = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * file.lines / MAX_LINES
		}
		else if (nodeSize === 'Connections') {
			let connectionCount = 0

			connections.forEach((connection) => {
				if (connection.source === index || connection.target === index) {
					connectionCount++
				}
			})

			radius = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * connectionCount / MAX_CONNECTIONS
		}

		nodes.push({
			id: index,
			name: fileName,
			fullPath: file.name,
			radius,
			lines: file.lines
		})
	}

	return nodes
}

// Find the most lines in a file
function getMaxLines(tempFiles: File[]) {
	let MAX_LINES = 100
	tempFiles.forEach((file) => {
		if (file.lines > MAX_LINES) {
			MAX_LINES = file.lines
		}
	})
	return MAX_LINES
}

// Find the most connections in a file
function getMaxConnections(connections: Connection[]) {
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

