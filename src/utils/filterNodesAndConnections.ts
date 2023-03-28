import { Connection, Node } from './types'

export const filterNodesAndConnections = ({
	nodes,
	connections,
	nodeDepth,
}: {
  nodes: Node[]
  connections: Connection[]
  nodeDepth: number
}) => {
	if (nodeDepth <= 0)
		return { filteredNodes: nodes, filteredConnections: connections }

	const filteredNodes: Node[] = nodes
		.filter((node) => node.depth <= nodeDepth && node.depth >= 0)
		.map((node) => {
			return { ...node }
		})

	filteredNodes.forEach((node, index) => {
		node.id = index
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

	filteredConnections.forEach((connection) => {
		const connectionSourceNode = nodes.find(
			(node) => node.id === connection.source,
		)
		const connectionTargetNode = nodes.find(
			(node) => node.id === connection.target,
		)

		console.log(connectionSourceNode, connectionTargetNode)

		// find the corresponding nodes in the filtered nodes array
		const filteredSourceNode = filteredNodes.find(
			(node) => node.fullPath === connectionSourceNode?.fullPath,
		)
		const filteredTargetNode = filteredNodes.find(
			(node) => node.fullPath === connectionTargetNode?.fullPath,
		)

		if (!filteredSourceNode || !filteredTargetNode) return

		connection.source = filteredSourceNode?.id || 0
		connection.target = filteredTargetNode?.id || 0
		connection.id = `${connection.source}-${connection.target}`
	})

	return { filteredNodes, filteredConnections }
}
