export const fetchSettings = (settings?: Record<string, unknown>) => {
	vscode.postMessage({
		command: 'fetchSettings',
		text: settings,
	})
}

export const getGraphData = (graphData: {
  nodeSize: string
  mode: 'Interaction' | 'Directory'
  collapseIds: number[]
  nodeDepth: number
  showNodeModules: boolean
}) => {
	vscode.postMessage({
		command: 'getGraphData',
		mode: graphData.mode,
		nodeSize: graphData.nodeSize,
		collapseIds: graphData.collapseIds.slice(),
		nodeDepth: graphData.nodeDepth,
		showNodeModules: graphData.showNodeModules,
	})
}
