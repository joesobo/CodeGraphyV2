import { Connection, Node } from './types'

export const filterCollapsed = (nodes: Node[], connections: Connection[]) => {
	// filter out any nodes that are hidden
	const filteredNodes = nodes.filter((node) => !node.hidden)

	// filter out any connections where either the source or target is hidden
	const filteredConnections = connections.filter((connection) => {
		const sourceNode = filteredNodes.find(
			(node) => node.id === connection.source,
		)
		const targetNode = filteredNodes.find(
			(node) => node.id === connection.target,
		)

		return sourceNode && targetNode
	})

	return { nodes: filteredNodes, connections: filteredConnections }
}
