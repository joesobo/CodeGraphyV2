import * as vscode from 'vscode'

import type { Node } from './types'

import fs from 'fs'
import path from 'path'

export const createFolder = async (node: Node, newFolderName: string) => {
	const newFolderPath = path.join(node.fullPath, newFolderName)

	// Only create the folder if it doesn't exist
	if (!fs.existsSync(newFolderPath)) {
		fs.mkdirSync(newFolderPath)
	} else {
		vscode.window.showErrorMessage(
			`File ${newFolderPath} already exists in ${node.fullPath}`,
		)
	}
}
