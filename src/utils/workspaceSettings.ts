import * as vscode from 'vscode'

export type Settings = {
  connectionType: 'Interaction' | 'Directory'
  nodeSize: 'Lines' | 'Connections'
  showNodeModules: boolean
  showOrphans: boolean
  showLabels: boolean
  showOutlines: boolean
  doCollisions: boolean
  nodeDepth: number
  maxNodeDepth: number
  centerForce: number
  chargeForce: number
  linkForce: number
  linkDistance: number
  nodeColor: 'D3' | 'Random'
  selectedD3Color: string
  lineColor: string
}

export const getWorkspaceSettings = () => {
	const configuration = vscode.workspace.getConfiguration('codegraphy')

	return {
		// Node Settings
		connectionType: configuration.get('connectionType'),
		nodeSize: configuration.get('nodeSize'),
		showNodeModules: configuration.get('showNodeModules'),
		showOrphans: configuration.get('showOrphans'),
		showLabels: configuration.get('showLabels'),
		showOutlines: configuration.get('showOutlines'),
		doCollisions: configuration.get('doCollisions'),
		// D3 Settings
		nodeDepth: configuration.get('nodeDepth'),
		maxNodeDepth: configuration.get('maxNodeDepth'),
		centerForce: configuration.get('centerForce'),
		chargeForce: configuration.get('chargeForce'),
		linkForce: configuration.get('linkForce'),
		linkDistance: configuration.get('linkDistance'),
		// Color Settings
		nodeColor: configuration.get('nodeColor'),
		selectedD3Color: configuration.get('selectedD3Color'),
		lineColor: configuration.get('lineColor'),
	}
}

export const updateWorkspaceSettings = (newSettings: Settings) => {
	const configuration = vscode.workspace.getConfiguration('codegraphy')
	const keys = Object.keys(newSettings) as (keyof Settings)[]

	keys.forEach((key) => {
		configuration.update(
			key,
			newSettings[key],
			vscode.ConfigurationTarget.Workspace,
		)
	})
}
