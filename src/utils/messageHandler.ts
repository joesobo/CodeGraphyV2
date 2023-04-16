import * as vscode from 'vscode'

import { copyPathToClipboard } from './copyPath'
import { createFile } from './createFile'
import { createFolder } from './createFolder'
import { deleteNode } from './deleteNode'
import { favoriteFile } from './favoriteFile'
import { getGraphData, refetchGraphData } from './getGraphData'
import { renameNode } from './renameNode'
import {
	Settings,
	getWorkspaceSettings,
	updateWorkspaceSettings,
} from './workspaceSettings'

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

			await refetchGraphData(webview)

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
		case 'openContextMenu': {
			await webview.postMessage({
				command: 'openContextMenu',
				text: message.text,
			})
			return
		}
		case 'createFile': {
			await createFile(message.text.nodeConnection, message.text.newFileName)
			await refetchGraphData(webview)
			return
		}
		case 'createFolder': {
			await createFolder(
				message.text.nodeConnection,
				message.text.newFolderName,
			)
			await refetchGraphData(webview)
			return
		}
		case 'renameNode': {
			await renameNode(message.text.node, message.text.newNodeName)
			await refetchGraphData(webview)
			return
		}
		case 'copyPath': {
			await copyPathToClipboard(message.text.path)
			return
		}
		case 'favoriteFile': {
			await favoriteFile(message.text.node)
			await refetchGraphData(webview)
			return
		}
		case 'deleteNode': {
			await deleteNode(message.text.node)
			await refetchGraphData(webview)
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
