import * as vscode from 'vscode'

import fs from 'fs'

export const deleteFile = (
	filepath: string,
) => {
	fs.unlink(filepath, (error) => {
		if (error) {
			vscode.window.showErrorMessage('Error deleting file:', error.message)
		}
	})
}
