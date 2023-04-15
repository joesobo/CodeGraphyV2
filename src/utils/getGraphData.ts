import * as vscode from 'vscode'

import { processGraphInfo } from './processGraphInfo'

let saveNodeSize: 'Lines' | 'Connections'
let saveMode: 'Interaction' | 'Directory'
let saveCollapseFullPaths: string[]
let saveNodeDepth: number
let saveShowNodeModules: boolean
let saveShowOrphans: boolean
let saveSearchInput: string
let saveExtensionFilters: string[]

export const getGraphData = async (
	webview: vscode.Webview,
	message: {
    mode: 'Interaction' | 'Directory'
    nodeSize: 'Lines' | 'Connections'
    collapseFullPaths: string[]
    nodeDepth: number
    showNodeModules: boolean
    showOrphans: boolean
    searchInput: string
    extensionFilters: string[]
  },
) => {
	// setup
	saveMode = message.mode
	saveNodeSize = message.nodeSize
	saveCollapseFullPaths = message.collapseFullPaths
	saveNodeDepth = message.nodeDepth
	saveShowNodeModules = message.showNodeModules
	saveShowOrphans = message.showOrphans
	saveSearchInput = message.searchInput
	saveExtensionFilters = message.extensionFilters

	const { nodes, connections } = processGraphInfo({
		mode: message.mode,
		nodeSize: message.nodeSize,
		collapseFullPaths: message.collapseFullPaths,
		nodeDepth: message.nodeDepth,
		showNodeModules: message.showNodeModules,
		showOrphans: message.showOrphans,
		searchInput: message.searchInput,
		extensionFilters: message.extensionFilters,
	})

	await webview.postMessage({
		command: 'setGraphData',
		text: {
			connections: connections,
			nodes: nodes,
			currentOpenFile:
        vscode.window.activeTextEditor?.document.fileName || null,
			showNodeModules: message.showNodeModules,
		},
	})
	return
}

export const refetchGraphData = async (webview: vscode.Webview) => {
	await getGraphData(webview, {
		mode: saveMode,
		nodeSize: saveNodeSize,
		collapseFullPaths: saveCollapseFullPaths,
		nodeDepth: saveNodeDepth,
		showNodeModules: saveShowNodeModules,
		showOrphans: saveShowOrphans,
		searchInput: saveSearchInput,
		extensionFilters: saveExtensionFilters,
	})
}
