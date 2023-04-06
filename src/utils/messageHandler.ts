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

export const handleMessages = () => {
	views.forEach((webview) => {
		receiveMessages(webview.view)

		sendMessages(webview.view)
	})
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

			views.forEach(async (webview) => {
				await webview.view.postMessage({
					command: 'setSettings',
					text: returnSettings,
				})
			})

			return
		}
		case 'setLanguageViewSettings': {
			const workspaceSettings = getWorkspaceSettings()
			workspaceSettings.nodeColor = message.text.nodeColor
			workspaceSettings.selectedD3Color = message.text.selectedD3Color

			const languageView = views.find(
				(view) => view.title === 'Languages View',
			)
			if (languageView) {
				await languageView.view.postMessage({
					command: 'setSettings',
					text: workspaceSettings,
				})
			}

			return
		}
		case 'setSettings': {
			if (message.text) {
				const messageSettings = message.text
				updateWorkspaceSettings({
					connectionType: messageSettings.connectionType,
					nodeSize: messageSettings.nodeSize,
					showNodeModules: messageSettings.showNodeModules,
					showOrphans: messageSettings.showOrphans,
					showLabels: messageSettings.showLabels,
					showOutlines: messageSettings.showOutlines,
					doCollisions: messageSettings.doCollisions,
					nodeDepth: messageSettings.nodeDepth,
					maxNodeDepth: messageSettings.maxNodeDepth,
					centerForce: messageSettings.centerForce,
					chargeForce: messageSettings.chargeForce,
					linkForce: messageSettings.linkForce,
					linkDistance: messageSettings.linkDistance,
					nodeColor: messageSettings.nodeColor,
					selectedD3Color: messageSettings.selectedD3Color,
					lineColor: messageSettings.lineColor,
				})
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
  },
) => {
	// setup
	saveMode = message.mode
	saveNodeSize = message.nodeSize
	saveCollapseFullPaths = message.collapseFullPaths
	saveNodeDepth = message.nodeDepth
	saveShowNodeModules = message.showNodeModules

	const { nodes, connections } = processGraphInfo({
		mode: message.mode,
		nodeSize: message.nodeSize,
		collapseFullPaths: message.collapseFullPaths,
		nodeDepth: message.nodeDepth,
		showNodeModules: message.showNodeModules,
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
