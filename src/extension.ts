import * as vscode from 'vscode'
import { BaseViewProvider } from './BaseViewProvider'

export function activate(context: vscode.ExtensionContext) {
	const provider = new BaseViewProvider(context.extensionUri)

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(BaseViewProvider.viewType, provider))
}
