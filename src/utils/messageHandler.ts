import * as vscode from 'vscode'

import { fetchDirectoryConnections } from './fetchDirectoryConnections'
import { fetchFiles } from './fetchFiles'
import { fetchInteractionConnections } from './fetchInteractionConnections'
import { processData } from './processData'

export const handleMessages = (webview: vscode.Webview) => {
	receiveMessages(webview)

	sendMessages(webview)
}

const receiveMessages = async (webview: vscode.Webview) => {
	const codeGraphyConfiguration = vscode.workspace.getConfiguration().codegraphy
	const blacklist = codeGraphyConfiguration.blacklist

	const currentPath = vscode.workspace.workspaceFolders
		? vscode.workspace.workspaceFolders[0].uri.path
		: ''
	const currentOpenFile = vscode.window.activeTextEditor?.document.fileName || null
	// currentPath = currentPath.startsWith('/') ? currentPath.substring(1) : currentPath
	// currentPath = replaceAll(currentPath, '/', '\\')

	webview.onDidReceiveMessage(async (message) => {
		switch (message.command) {
		case 'openFile':
			vscode.workspace.openTextDocument(vscode.Uri.file(message.text)).then(async (doc) => {
				vscode.window.showTextDocument(doc)
			})
			return
		case 'getGraphData': {
			const nodeSize = message.nodeSize
			const interactionConnections = message.interactionConnections
			const nodeDepth = message.nodeDepth
			const { files, dirs } = await fetchFiles(currentPath, blacklist, true)

			let processedData
			let connections

			if (interactionConnections === 'Interaction') {
				connections = await fetchInteractionConnections(files, currentPath)
				processedData = processData(files, nodeSize, connections, currentOpenFile, nodeDepth)

			} else {
				connections = fetchDirectoryConnections(files, dirs)
				processedData = processData(files, nodeSize, connections, currentOpenFile, nodeDepth, dirs)
			}

			const nodes = processedData.nodes
			connections = processedData.connections

			await webview.postMessage({
				command: 'setGraphData',
				text: {
					connections: connections,
					nodes: nodes,
					currentOpenFile: currentOpenFile
				}
			})
			return
		}
		}
	})
}

const sendMessages = (webview: vscode.Webview) => {
	vscode.window.onDidChangeActiveTextEditor(async (editor) => {
		if (editor) {
			await webview.postMessage({
				command: 'setCurrentFile',
				text: editor.document.fileName ?? null
			})
		}
	})
}
