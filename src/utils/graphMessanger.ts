export const getGraphData = (graphData: {
	nodeSize: string,
	interactionConnections: string,
}) => {
	vscode.postMessage({
		command: 'getGraphData',
		nodeSize: graphData.nodeSize,
		interactionConnections: graphData.interactionConnections
	})
}
