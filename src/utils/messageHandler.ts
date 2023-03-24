import * as vscode from 'vscode'

import { processData } from './processData'

const codeGraphyConfiguration = vscode.workspace.getConfiguration().codegraphy
const blacklist = codeGraphyConfiguration.blacklist

let saveNodeSize: 'Lines' | 'Connections'
let saveInteractionConnections: 'Interaction' | 'Directory'
let saveNodeDepth: number

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
			})

			return
		case 'getGraphData': {
			await getGraphData(webview, message)
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
  },
) => {
	// setup
	saveNodeSize = message.nodeSize
	saveInteractionConnections = message.interactionConnections
	saveNodeDepth = message.nodeDepth

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
		displayPackages: true,
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
