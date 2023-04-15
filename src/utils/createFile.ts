import * as vscode from 'vscode'

import fs from 'fs'
import path from 'path'

export const createFile = async (
	connectionName: string,
	connectionPath: string,
	newFileName: string,
) => {
	const fileConnectionDir = path.dirname(connectionPath)
	const newFilePath = path.join(fileConnectionDir, newFileName)
	const fileContent = `// CodeGraphy connect: './${connectionName}'`

	fs.writeFileSync(newFilePath, fileContent)
	const newFileUri = vscode.Uri.file(newFilePath)
	const document = await vscode.workspace.openTextDocument(newFileUri)
	await vscode.window.showTextDocument(document)
}
