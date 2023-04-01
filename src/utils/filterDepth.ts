import { Connection, Node } from './types'

export const filterDepth = ({
	nodes,
	connections,
	nodeDepth,
}: {
  nodes: Node[]
  connections: Connection[]
  nodeDepth: number
}) => {
	if (nodeDepth <= 0) {
		return { filteredNodes: nodes, filteredConnections: connections }
	}

	const filteredNodes: Node[] = nodes
		.filter((node) => node.depth <= nodeDepth && node.depth >= 0)
		.map((node) => {
			return { ...node }
		})

	const filteredConnections: Connection[] = connections.filter((connection) => {
		const sourceNode = nodes.find((node) => node.id === connection.source)
		const targetNode = nodes.find((node) => node.id === connection.target)

		return (
			sourceNode &&
      sourceNode.depth >= 0 &&
      sourceNode.depth <= nodeDepth &&
      targetNode &&
      targetNode.depth >= 0 &&
      targetNode.depth <= nodeDepth
		)
	})

	return { filteredNodes, filteredConnections }
}
