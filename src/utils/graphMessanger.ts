export const fetchSettings = (settings?: Record<string, unknown>) => {
	vscode.postMessage({
		command: 'fetchSettings',
		text: settings,
	})
}

export const getGraphData = (graphData: {
  nodeSize: string
  interactionConnections: 'Interaction' | 'Directory'
  nodeDepth: number
  showNodeModules: boolean
}) => {
	vscode.postMessage({
		command: 'getGraphData',
		nodeSize: graphData.nodeSize,
		interactionConnections: graphData.interactionConnections,
		nodeDepth: graphData.nodeDepth,
		showNodeModules: graphData.showNodeModules,
	})
}
