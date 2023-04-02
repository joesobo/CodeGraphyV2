import { Connection, Node } from './types'

export const filterCollapsed = (nodes: Node[], connections: Connection[]) => {
	// filter out any nodes that are hidden
	const filteredNodes = nodes.filter((node) => !node.hidden)

	// filter out any connections where either the source or target is hidden
	const filteredConnections = connections.filter((connection) => {
		const regex = /(\d+)-(\d+)/
		const match = connection.id.match(regex)

		if (match) {
			const sourceId = Number.parseInt(match[1])
			const targetId = Number.parseInt(match[2])

			const sourceNode = filteredNodes.find((node) => node.id === sourceId)
			const targetNode = filteredNodes.find((node) => node.id === targetId)

			return sourceNode && targetNode
		}

		return false
	})

	return { nodes: filteredNodes, connections: filteredConnections }
}
