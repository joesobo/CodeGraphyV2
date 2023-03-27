import * as vscode from 'vscode'

import type { Directory, File } from './types'

import fs from 'fs'
import path from 'path'

import { containsBlacklist } from './blacklist'

export const getDirectoryInfo = (mode: 'Interaction' | 'Directory') => {
	const rootDirectory = vscode.workspace.workspaceFolders?.[0]?.uri?.path ?? ''

	const files: File[] = []
	const dirs: Directory[] = []
	const touchedDirs: string[] = [rootDirectory]

	if (mode === 'Directory') {
		dirs.push({ name: rootDirectory })
	}

	while (touchedDirs.length > 0) {
		const currentDir = touchedDirs.pop() || ''

		const directoryFiles = fs.readdirSync(currentDir)

		for (const file of directoryFiles) {
			const filePath = path.join(currentDir, file)

			if (containsBlacklist(filePath)) continue

			if (fs.statSync(filePath).isFile()) {
				const fileContents = fs.readFileSync(filePath, 'utf8')
				const lines = fileContents.split('\n').length

				files.push({
					name: filePath,
					lines: lines,
				})
			} else {
				touchedDirs.push(filePath)

				if (mode === 'Directory') {
					dirs.push({ name: filePath })
				}
			}
		}
	}

	return { files, dirs }
}
