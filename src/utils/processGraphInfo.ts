import * as vscode from 'vscode'

import type { UnprocessedNode } from './types'

import { assignNodeDepth } from './assignNodeDepth'
import { collapseNodes } from './collapseNodes'
import { filterCollapsed } from './filterCollapsed'
import { filterDepth } from './filterDepth'
import { getConnections } from './getConnections'
import { getDirectoryInfo } from './getDirectoryInfo'
import { getNodeModules } from './getNodeModules'
import { getNodes } from './getNodes'
import { getUnprocessedNodes } from './getUnprocessedNodes'

export const processGraphInfo = ({
	mode,
	nodeSize,
	collapseIds,
	nodeDepth,
	showNodeModules,
}: {
  mode: 'Interaction' | 'Directory'
  nodeSize: 'Lines' | 'Connections'
  collapseIds: number[]
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

	const { filteredNodes, filteredConnections } = filterDepth({
		nodes,
		connections,
		nodeDepth,
	})

	const currentOpenFile =
    vscode.window.activeTextEditor?.document.fileName || null

	nodes = collapseNodes({
		activeId:
      filteredNodes.find((node) => node.fullPath === currentOpenFile)?.id ?? -1,
		collapseIds,
		nodes: filteredNodes,
		connections: filteredConnections,
	})

	const result = filterCollapsed(nodes, filteredConnections)

	return result
}
