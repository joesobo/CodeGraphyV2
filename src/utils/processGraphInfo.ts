import type { UnprocessedNode } from './types'

import { getConnections } from './getConnections'
import { getDirectoryInfo } from './getDirectoryInfo'
import { getNodeModules } from './getNodeModules'
import { getNodes } from './getNodes'
import { getUnprocessedNodes } from './getUnprocessedNodes'

export const processGraphInfo = (
	mode: 'Interaction' | 'Directory',
	nodeSize: 'Lines' | 'Connections',
) => {
	const { files, dirs } = getDirectoryInfo(mode)
	const packages = getNodeModules(files, mode)

	const unprocessedNodes: UnprocessedNode[] = getUnprocessedNodes(
		files,
		dirs,
		packages,
	)

	const connections = getConnections(unprocessedNodes, mode)
	const nodes = getNodes(unprocessedNodes, connections, nodeSize)

	return { nodes, connections }
}
