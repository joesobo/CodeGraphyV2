import * as vscode from 'vscode'

import { settings } from './graphSettings'
import { processGraphInfo } from './processGraphInfo'

let saveNodeSize: 'Lines' | 'Connections'
let saveMode: 'Interaction' | 'Directory'
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

export const handleMessages = (webview: vscode.Webview) => {
	receiveMessages(webview)

	sendMessages(webview)
}

const receiveMessages = async (webview: vscode.Webview) => {
	webview.onDidReceiveMessage(async (message) => {
		switch (message.command) {
		case 'openFile':
			await vscode.workspace
				.openTextDocument(vscode.Uri.file(message.text))
				.then(async (doc) => {
					await vscode.window.showTextDocument(doc)
				})

			await getGraphData(webview, {
				mode: saveMode,
				nodeSize: saveNodeSize,
				nodeDepth: saveNodeDepth,
				showNodeModules: saveShowNodeModules,
			})

			return
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
		}
	})
}

const getGraphData = async (
	webview: vscode.Webview,
	message: {
    mode: 'Interaction' | 'Directory'
    nodeSize: 'Lines' | 'Connections'
    nodeDepth: number
    showNodeModules: boolean
  },
) => {
	// setup
	saveMode = message.mode
	saveNodeSize = message.nodeSize
	saveNodeDepth = message.nodeDepth
	saveShowNodeModules = message.showNodeModules

	const { nodes, connections } = processGraphInfo(
		message.mode,
		message.nodeSize,
		message.showNodeModules,
	)

	await webview.postMessage({
		command: 'setGraphData',
		text: {
			connections: connections,
			nodes: nodes,
			currentOpenFile:
        vscode.window.activeTextEditor?.document.fileName || null,
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
