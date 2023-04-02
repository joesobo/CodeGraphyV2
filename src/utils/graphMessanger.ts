export const fetchSettings = (settings?: Record<string, unknown>) => {
	vscode.postMessage({
		command: 'fetchSettings',
		text: settings,
	})
}

export const getGraphData = (graphData: {
  nodeSize: string
  mode: 'Interaction' | 'Directory'
  collapseFullPaths: string[]
  nodeDepth: number
  showNodeModules: boolean
}) => {
	vscode.postMessage({
		command: 'getGraphData',
		mode: graphData.mode,
		nodeSize: graphData.nodeSize,
		collapseFullPaths: graphData.collapseFullPaths.slice(),
		nodeDepth: graphData.nodeDepth,
		showNodeModules: graphData.showNodeModules,
	})
}
