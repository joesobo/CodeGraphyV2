import type { Connection, Node } from './types'

export const filterSearch = (
	nodes: Node[],
	connections: Connection[],
	searchInput: string,
) => {
	if (searchInput === undefined) return { nodes, connections }

	const filteredNodes: Node[] = nodes.filter((node) => {
		const search = searchInput.toLowerCase()
		return node.name.toLowerCase().includes(search)
	})

	// filter out any connections that have non-existing nodes
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
