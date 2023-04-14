import * as vscode from 'vscode'

import { processGraphInfo } from './processGraphInfo'
import {
	Settings,
	getWorkspaceSettings,
	updateWorkspaceSettings,
} from './workspaceSettings'

let saveNodeSize: 'Lines' | 'Connections'
let saveMode: 'Interaction' | 'Directory'
let saveCollapseFullPaths: string[]
let saveNodeDepth: number
let saveShowNodeModules: boolean
let saveShowOrphans: boolean
let saveSearchInput: string

type View = {
  view: vscode.Webview
  title: string
}

export const views: View[] = []

export const registerView = (view: vscode.Webview, title: string) => {
	views.push({
		view,
		title,
	})
}

export const handleMessages = (view: vscode.Webview) => {
	receiveMessages(view)

	sendMessages(view)
}

const receiveMessages = async (webview: vscode.Webview) => {
	webview.onDidReceiveMessage(async (message) => {
		switch (message.command) {
		case 'openFile': {
			await vscode.workspace
				.openTextDocument(vscode.Uri.file(message.text))
				.then(async (doc) => {
					await vscode.window.showTextDocument(doc)
				})

			await getGraphData(webview, {
				mode: saveMode,
				nodeSize: saveNodeSize,
				collapseFullPaths: saveCollapseFullPaths,
				nodeDepth: saveNodeDepth,
				showNodeModules: saveShowNodeModules,
				showOrphans: saveShowOrphans,
				searchInput: saveSearchInput,
			})

			return
		}
		case 'collapseNode': {
			await webview.postMessage({
				command: 'collapseNode',
				fullPath: message.text,
			})
			return
		}
		case 'getGraphData': {
			await getGraphData(webview, message)
			return
		}
		case 'fetchSettings': {
			const workspaceSettings = getWorkspaceSettings()
			const returnSettings: Settings = { ...workspaceSettings }

			await webview.postMessage({
				command: 'setSettings',
				text: returnSettings,
			})
			return
		}
		case 'setStatsViewSettings': {
			const statsView = views.find((view) => view.title === 'Stats View')

			if (statsView) {
				const workspaceSettings = getWorkspaceSettings()
				workspaceSettings.nodeColor = message.text.nodeColor
				workspaceSettings.selectedD3Color = message.text.selectedD3Color
				workspaceSettings.connectionType = message.text.mode
				await statsView.view.postMessage({
					command: 'setSettings',
					text: workspaceSettings,
				})
			}

			return
		}
		case 'setSettings': {
			if (message.text) {
				const messageSettings = message.text as Settings
				updateWorkspaceSettings(messageSettings)
			}

			return
		}
		case 'overrideExtensionColor': {
			const graphView = views.find((view) => view.title === 'Graph View')
			if (graphView) {
				await graphView.view.postMessage({
					command: 'overrideExtensionColor',
					override: message.override,
				})
			}
		}
		}
	})
}

const getGraphData = async (
	webview: vscode.Webview,
	message: {
    mode: 'Interaction' | 'Directory'
    nodeSize: 'Lines' | 'Connections'
    collapseFullPaths: string[]
    nodeDepth: number
    showNodeModules: boolean
    showOrphans: boolean
    searchInput: string
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

	const { nodes, connections } = processGraphInfo({
		mode: message.mode,
		nodeSize: message.nodeSize,
		collapseFullPaths: message.collapseFullPaths,
		nodeDepth: message.nodeDepth,
		showNodeModules: message.showNodeModules,
		showOrphans: message.showOrphans,
		searchInput: message.searchInput,
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

const sendMessages = (webview: vscode.Webview) => {
	vscode.window.onDidChangeActiveTextEditor(async (editor) => {
		if (editor) {
			await webview.postMessage({
				command: 'setCurrentFile',
				text: editor.document.fileName ?? null,
			})
		}
	})
}
