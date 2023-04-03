import * as vscode from 'vscode'

import { settings } from './graphSettings'
import { processGraphInfo } from './processGraphInfo'

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
			const returnSettings: Record<string, unknown> = settings

			if (message.text) {
				// loop over every key in text object
				for (const key in message.text) {
					returnSettings[key] = message.text[key]
				}
			}

			views.forEach(async (webview) => {
				await webview.view.postMessage({
					command: 'setSettings',
					text: returnSettings,
				})
			})

			return
		}
		case 'saveSettings': {
			if (message.text) {
				// loop over every key in text object
				for (const key in message.text) {
					settings[key] = message.text[key]
				}
			}

			const languageView = views.find(
				(view) => view.title === 'Languages View',
			)
			if (languageView) {
				await languageView.view.postMessage({
					command: 'setSettings',
					text: settings,
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
