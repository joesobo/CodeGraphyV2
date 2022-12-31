import * as vscode from 'vscode'
import { fetchFiles } from './fetchFiles'
import { fetchConnections } from './fetchConnections'
import { processData } from './dataProcessor'
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

	const files = fetchFiles(currentPath, blacklist)

	webview.onDidReceiveMessage(async (message) => {
		switch (message.command) {
		case 'getGraphData':
			await webview.postMessage({
				command: 'setGraphData',
				text: {
					connections: await fetchConnections(files, currentPath),
					nodes: processData(files)
				}
			})
			return
		}
	})
}
