import * as vscode from 'vscode'

export const copyPathToClipboard = async (filePath: string) => {
	await vscode.env.clipboard.writeText(filePath)
	vscode.window.showInformationMessage('File path copied to clipboard.')
}
