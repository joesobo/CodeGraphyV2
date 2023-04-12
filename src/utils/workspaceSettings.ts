import * as vscode from 'vscode'

export type Settings = {
  connectionType: 'Interaction' | 'Directory'
  nodeSize: 'Lines' | 'Connections'
  showNodeModules: boolean
  showOrphans: boolean
  showLabels: boolean
  showOutlines: boolean
  showArrows: boolean
  doCollisions: boolean
  chargeForce: number
  linkDistance: number
  nodeColor: 'D3' | 'Random'
  selectedD3Color: string
}

export const getWorkspaceSettings = () => {
	const configuration = vscode.workspace.getConfiguration('codegraphy')

	// Node Settings
	const connectionType = configuration.connectionType
	const nodeSize = configuration.nodeSize
	const showNodeModules = configuration.showNodeModules
	const showOrphans = configuration.showOrphans
	const showLabels = configuration.showLabels
	const showOutlines = configuration.showOutlines
	const showArrows = configuration.showArrows
	const doCollisions = configuration.doCollisions

	// D3 Settings
	const chargeForce = configuration.chargeForce
	const linkDistance = configuration.linkDistance

	// Color Settings
	const nodeColor = configuration.nodeColor
	const selectedD3Color = configuration.selectedD3Color

	return {
		connectionType,
		nodeSize,
		nodeColor,
		selectedD3Color,
		chargeForce,
		linkDistance,
		showNodeModules,
		showOrphans,
		showLabels,
		showOutlines,
		showArrows,
		doCollisions,
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
