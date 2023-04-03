// Display Settings
export const connectionType: 'Interaction' | 'Directory' = 'Interaction'
export const nodeSize = 'Lines'
export const nodeColor = 'D3'
export const selectedD3Color = 'Spectral'

// D3 Settings
export const nodeDepth = 0
export const maxNodeDepth = 0
export const centerForce = 0
export const chargeForce = -100
export const linkForce = 0
export const linkDistance = 100

// Extra Settings
export const showNodeModules = false
export const showOrphans = true
export const showLabels = true
export const showOutlines = true
export const doCollisions = true
export const lineColor = '#ff0000'

export const settings: Record<string, unknown> = {
	connectionType,
	nodeSize,
	nodeColor,
	selectedD3Color,
	nodeDepth,
	maxNodeDepth,
	centerForce,
	chargeForce,
	linkForce,
	linkDistance,
	showNodeModules,
	showOrphans,
	showLabels,
	showOutlines,
	doCollisions,
	lineColor,
}
