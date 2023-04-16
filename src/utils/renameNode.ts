import * as vscode from 'vscode'

import type { Node } from './types'

import fs from 'fs'
import path from 'path'

export const renameNode = async (node: Node, newNodeName: string) => {
	const oldPath = node.fullPath
	const parentDir = path.dirname(oldPath)
	const newPath = path.join(parentDir, newNodeName)

	// Check if the newPath already exists
	if (fs.existsSync(newPath)) {
		vscode.window.showErrorMessage(
			`${node.type} ${newNodeName} already exists in ${parentDir}`,
		)
		return
	}

	// Rename the file or directory
	fs.renameSync(oldPath, newPath)
	vscode.window.showInformationMessage(
		`${node.type} has been renamed from ${path.basename(
			oldPath,
		)} to ${newNodeName}`,
	)
}
