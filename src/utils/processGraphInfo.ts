import type { UnprocessedNode } from './types'

import { assignNodeDepth } from './assignNodeDepth'
import { filterNodesAndConnections } from './filterNodesAndConnections'
import { getConnections } from './getConnections'
import { getDirectoryInfo } from './getDirectoryInfo'
import { getNodeModules } from './getNodeModules'
import { getNodes } from './getNodes'
import { getUnprocessedNodes } from './getUnprocessedNodes'

export const processGraphInfo = ({
	mode,
	nodeSize,
	nodeDepth,
	showNodeModules,
}: {
  mode: 'Interaction' | 'Directory'
  nodeSize: 'Lines' | 'Connections'
  nodeDepth: number
  showNodeModules: boolean
}) => {
	const { files, dirs } = getDirectoryInfo(mode)
	const packages = getNodeModules({ files, mode, showNodeModules })

	const unprocessedNodes: UnprocessedNode[] = getUnprocessedNodes(
		files,
		dirs,
		packages,
	)

	const connections = getConnections(unprocessedNodes, mode)
	let nodes = getNodes(unprocessedNodes, connections, nodeSize)

	nodes = assignNodeDepth(nodes, connections)

	const { filteredNodes, filteredConnections } = filterNodesAndConnections({
		nodes,
		connections,
		nodeDepth,
	})

	return { nodes: filteredNodes, connections: filteredConnections }
}
