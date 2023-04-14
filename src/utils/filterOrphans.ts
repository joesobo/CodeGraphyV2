import { Connection, Node } from './types'

export const filterOrphans = (nodes: Node[], connections: Connection[]) => {
	const filteredNodes: Node[] = nodes.filter((node) => {
		return connections.some((connection) => {
			const regex = /(\d+)-(\d+)/
			const match = connection.id.match(regex)

			if (match) {
				const sourceId = Number.parseInt(match[1])
				const targetId = Number.parseInt(match[2])

				if (sourceId === node.id || targetId === node.id) {
					return true
				}
			}
		})
	})

	return { nodes: filteredNodes, connections }
}
