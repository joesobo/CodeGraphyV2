import * as vscode from 'vscode'

import { GraphViewProvider, StatsViewProvider } from './providers'

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			'codegraphy-view-graph',
			new GraphViewProvider(context.extensionUri),
		),
	)

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			'codegraphy-view-stats',
			new StatsViewProvider(context.extensionUri),
		),
	)
}
