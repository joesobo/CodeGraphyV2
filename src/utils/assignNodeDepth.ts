import * as vscode from 'vscode'

import { Connection, Node } from './types'

export const assignNodeDepth = (nodes: Node[], connections: Connection[]) => {
	const queue: Node[] = []
	const visited: Node[] = []
	const currentFile = vscode.window.activeTextEditor?.document.fileName || null

	const currentNode = nodes.find((node) => node.fullPath === currentFile)

	if (!currentNode) {
		return nodes
	}

	currentNode.depth = 0
	queue.push(currentNode)
	visited.push(currentNode)

	while (queue.length > 0) {
		const currentNode = queue.shift() as Node
		const currentIndex = nodes.findIndex((node) => node.id === currentNode.id)

		connections.forEach((connection) => {
			const targetNode = nodes[connection.target]
			const sourceNode = nodes[connection.source]

			if (
				connection.source === currentIndex &&
        !visited.find((visit) => visit.fullPath === targetNode.fullPath)
			) {
				targetNode.depth = currentNode.depth + 1
				queue.push(targetNode)
				visited.push(targetNode)
			} else if (
				connection.target === currentIndex &&
        !visited.find((visit) => visit.fullPath === sourceNode.fullPath)
			) {
				sourceNode.depth = currentNode.depth + 1
				queue.push(sourceNode)
				visited.push(sourceNode)
			}
		})
	}

	return nodes
}
