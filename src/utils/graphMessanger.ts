export const saveSettings = (settings?: Record<string, unknown>) => {
	vscode.postMessage({
		command: 'saveSettings',
		text: settings,
	})
}

export const fetchSettings = () => {
	vscode.postMessage({
		command: 'fetchSettings',
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
