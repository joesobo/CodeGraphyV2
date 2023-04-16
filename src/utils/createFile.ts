import * as vscode from 'vscode'

import type { Node } from './types'

import fs from 'fs'
import path from 'path'

export const createFile = async (nodeConnection: Node, newFileName: string) => {
	const connectionDir =
    nodeConnection.type === 'Directory'
    	? nodeConnection.fullPath
    	: path.dirname(nodeConnection.fullPath)
	const newFilePath = path.join(connectionDir, newFileName)
	const fileContent = `// CodeGraphy connect: './${nodeConnection.name}'`

	// Only create the file if it doesn't exist
	if (!fs.existsSync(newFilePath)) {
		fs.writeFileSync(newFilePath, fileContent)
		const newFileUri = vscode.Uri.file(newFilePath)
		const document = await vscode.workspace.openTextDocument(newFileUri)
		await vscode.window.showTextDocument(document)
	} else {
		vscode.window.showErrorMessage(
			`File ${newFileName} already exists in ${connectionDir}`,
		)
	}
}
