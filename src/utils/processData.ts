import { getRandomInt } from './basic'
import type { Connection, Directory, File, Node } from './types'

const MIN_RADIUS = 10
const MAX_RADIUS = 25

export const processData = (
	files: File[],
	nodeSize: string,
	connections: Connection[],
	dirs?: Directory[],
) => {
	const nodes: Node[] = []

	let nodeIndex = 0

	if (dirs) {
		dirs.forEach((dir, dirIndex) => {
			const dirPath = dir.name.replace(/\\/g, '/')
			const dirName = dirPath.split('/').pop() || ''

			const radius = getNodeSize(nodeSize, dirIndex, files, connections)

			nodes.push({
				id: nodeIndex,
				name: dirName,
				fullPath: dir.name,
				radius,
			})
			nodeIndex++
		})
	}

	// push root nodes
	for (let index = 0; index < files.length; index++) {
		const file = files[index]
		const filePath = file.name.replace(/\\/g, '/')
		const fileName = filePath.split('/').pop() || ''

		const radius = getNodeSize(nodeSize, index, files, connections)

		nodes.push({
			id: nodeIndex + index,
			name: fileName,
			fullPath: file.name,
			radius,
			lines: file.lines
		})
	}

	return nodes
}

// Find the Radius for the Node based on settings
const getNodeSize = (nodeSize: string, fileIndex: number, files: File[], connections: Connection[]) => {
	const file = files[fileIndex]
	const MAX_LINES = getMaxLines(files)
	const MAX_CONNECTIONS = getMaxConnections(connections)

	let radius = getRandomInt(15) + 10

	if (nodeSize === 'Lines') {
		radius = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * file.lines / MAX_LINES
	}
	else if (nodeSize === 'Connections') {
		let connectionCount = 0

		connections.forEach((connection) => {
			if (connection.source === fileIndex || connection.target === fileIndex) {
				connectionCount++
			}
		})

		radius = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * connectionCount / MAX_CONNECTIONS
	}

	return radius
}

// Find the most lines in a file
const getMaxLines = (files: File[]) => {
	let MAX_LINES = 100
	files.forEach((file) => {
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

