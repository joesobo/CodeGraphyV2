import * as vscode from 'vscode'

import { settings } from './graphSettings'
import { processData } from './processData'

const codeGraphyConfiguration = vscode.workspace.getConfiguration().codegraphy
const blacklist = codeGraphyConfiguration.blacklist

let saveNodeSize: 'Lines' | 'Connections'
let saveInteractionConnections: 'Interaction' | 'Directory'
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
				nodeSize: saveNodeSize,
				interactionConnections: saveInteractionConnections,
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
    nodeSize: 'Lines' | 'Connections'
    interactionConnections: 'Interaction' | 'Directory'
    nodeDepth: number
    showNodeModules: boolean
  },
) => {
	// setup
	saveNodeSize = message.nodeSize
	saveInteractionConnections = message.interactionConnections
	saveNodeDepth = message.nodeDepth
	saveShowNodeModules = message.showNodeModules

	// vscode data
	const currentPath = vscode.workspace.workspaceFolders
		? vscode.workspace.workspaceFolders[0].uri.path
		: ''
	const currentOpenFile =
    vscode.window.activeTextEditor?.document.fileName || null

	const processedData = await processData({
		openFile: currentOpenFile,
		path: currentPath,
		nodeSize: message.nodeSize,
		nodeDepth: message.nodeDepth,
		blacklist,
		connectionMode: message.interactionConnections,
		displayPackages: message.showNodeModules,
	})
	const { nodes, connections } = processedData

	await webview.postMessage({
		command: 'setGraphData',
		text: {
			connections: connections,
			nodes: nodes,
			currentOpenFile: currentOpenFile,
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
