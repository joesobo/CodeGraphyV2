import { Connection, Node } from './types'

export const normalizeIds = (nodes: Node[], connections: Connection[]) => {
	nodes.forEach((node, index) => {
		connections.forEach((connection) => {
			if (connection.source === node.id) connection.source = index
			if (connection.target === node.id) connection.target = index
			connection.id = `${connection.source}-${connection.target}`
		})
		node.id = index
	})

	return { nodes, connections }
}
