import * as vscode from 'vscode'

import type { UnprocessedNode } from './types'

import { assignNodeDepth } from './assignNodeDepth'
import { collapseNodes } from './collapseNodes'
import { filterCollapsed } from './filterCollapsed'
import { filterDepth } from './filterDepth'
import { filterOrphans } from './filterOrphans'
import { filterSearch } from './filterSearch'
import { getConnections } from './getConnections'
import { getDirectoryInfo } from './getDirectoryInfo'
import { getNodeModules } from './getNodeModules'
import { getNodes } from './getNodes'
import { getUnprocessedNodes } from './getUnprocessedNodes'
import { normalizeIds } from './normalizeIds'

export const processGraphInfo = ({
	mode,
	nodeSize,
	collapseFullPaths,
	nodeDepth,
	showNodeModules,
	showOrphans,
	searchInput,
}: {
  mode: 'Interaction' | 'Directory'
  nodeSize: 'Lines' | 'Connections'
  collapseFullPaths: string[]
  nodeDepth: number
  showNodeModules: boolean
  showOrphans: boolean
  searchInput: string
}) => {
	const { files, dirs } = getDirectoryInfo(mode)
	const packages = getNodeModules({ files, mode, showNodeModules })

	const unprocessedNodes: UnprocessedNode[] = getUnprocessedNodes(
		files,
		dirs,
		packages,
	)

	const rawConnections = getConnections(unprocessedNodes, mode)
	let nodes = getNodes(unprocessedNodes, rawConnections, nodeSize)

	nodes = assignNodeDepth(nodes, rawConnections)

	const { filteredNodes, filteredConnections } = filterDepth({
		nodes,
		connections: rawConnections,
		nodeDepth,
	})

	const currentOpenFile =
    vscode.window.activeTextEditor?.document.fileName || null
	const collapseIds = collapseFullPaths.map(
		(path) => filteredNodes.find((node) => node.fullPath === path)?.id ?? -1,
	)

	nodes = collapseNodes({
		activeId:
      filteredNodes.find((node) => node.fullPath === currentOpenFile)?.id ?? -1,
		collapseIds,
		nodes: filteredNodes,
		connections: filteredConnections,
	})

	let result = filterCollapsed(nodes, filteredConnections)

	if (!showOrphans) {
		result = filterOrphans(nodes, filteredConnections)
	}

	result = filterSearch(nodes, filteredConnections, searchInput)

	result = normalizeIds(result.nodes, result.connections)

	return result
}
