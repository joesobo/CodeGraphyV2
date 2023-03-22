export const getGraphData = (graphData: {
  nodeSize: string
  interactionConnections: string
  nodeDepth: number
}) => {
  vscode.postMessage({
    command: 'getGraphData',
    nodeSize: graphData.nodeSize,
    interactionConnections: graphData.interactionConnections,
    nodeDepth: graphData.nodeDepth,
  })
}
