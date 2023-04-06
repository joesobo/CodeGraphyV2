import type { Settings } from './workspaceSettings'

export const overrideExtensionColor = (name: string, color: string) => {
	vscode.postMessage({
		command: 'overrideExtensionColor',
		override: {
			name,
			color,
		},
	})
}

export const setSettings = (settings: Settings) => {
	vscode.postMessage({
		command: 'setSettings',
		text: settings,
	})
}

export const setLanguageViewSettings = (settings?: Record<string, unknown>) => {
	vscode.postMessage({
		command: 'setLanguageViewSettings',
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
