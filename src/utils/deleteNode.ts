import * as vscode from 'vscode'

import type { Node } from './types'

import fs from 'fs'

export const deleteNode = (node: Node): Promise<void> => {
	return new Promise((resolve, reject) => {
		if (node.type === 'File') {
			fs.unlink(node.fullPath, (error) => {
				if (error) {
					vscode.window.showErrorMessage('Error deleting file:', error.message)
					reject(error)
				} else {
					resolve()
				}
			})
		} else if (node.type === 'Directory') {
			fs.rm(node.fullPath, { recursive: true, force: true }, (error) => {
				if (error) {
					vscode.window.showErrorMessage(
						'Error deleting directory:',
						error.message,
					)
					reject(error)
				} else {
					resolve()
				}
			})
		} else {
			const errorMessage = 'Invalid node type: ' + node.type
			vscode.window.showErrorMessage(errorMessage)
			reject(new Error(errorMessage))
		}
	})
}
