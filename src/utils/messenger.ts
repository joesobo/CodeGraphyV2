import * as vscode from 'vscode'

import { fetchConnections } from './fetchConnections'
import { fetchFiles } from './fetchFiles'
import { processData } from './processData'
import { replaceAll } from './basic'

export const handleMessages = (webview: vscode.Webview) => {
	receiveMessages(webview)
}

const receiveMessages = async (webview: vscode.Webview) => {
	const codeGraphyConfiguration = vscode.workspace.getConfiguration().codegraphy
	const blacklist = codeGraphyConfiguration.blacklist

	let currentPath = vscode.workspace.workspaceFolders
		? vscode.workspace.workspaceFolders[0].uri.path
		: ''
	currentPath = currentPath.startsWith('/') ? currentPath.substring(1) : currentPath
	currentPath = replaceAll(currentPath, '/', '\\')

	webview.onDidReceiveMessage(async (message) => {
		switch (message.command) {
		case 'getGraphData': {
			const nodeSize = message.nodeSize
			const files = await fetchFiles(currentPath, blacklist, true)
			const connections = await fetchConnections(files, currentPath)
			await webview.postMessage({
				command: 'setGraphData',
				text: {
					connections: connections,
					nodes: processData(files, nodeSize, connections)
				}
			})
			return
		}
		}
	})
}
