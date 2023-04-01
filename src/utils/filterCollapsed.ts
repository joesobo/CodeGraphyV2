import { Connection, Node } from './types'

export const filterCollapsed = (nodes: Node[], connections: Connection[]) => {
	// filter out any nodes that are hidden
	const filteredNodes = nodes.filter((node) => !node.hidden)

	// filter out any connections where either the source or target is hidden
	const filteredConnections = connections.filter((connection) => {
		const source = Number.parseInt(connection.id.substring(0, 1))
		const target = Number.parseInt(connection.id.substring(2, 3))

		const sourceNode = filteredNodes.find((node) => node.id === source)
		const targetNode = filteredNodes.find((node) => node.id === target)

		return sourceNode && targetNode
	})

	return { nodes: filteredNodes, connections: filteredConnections }
}
