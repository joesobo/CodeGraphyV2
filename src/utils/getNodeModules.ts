import * as vscode from 'vscode'

import type { File, Package } from './types'

import fs from 'fs'
import path from 'path'

export const getNodeModules = ({
	files,
	mode,
	showNodeModules,
}: {
  files: File[]
  mode: 'Interaction' | 'Directory'
  showNodeModules: boolean
}) => {
	if (!showNodeModules) return []
	if (mode === 'Directory') return []

	const packages: Package[] = []

	files.forEach((file) => {
		let fileDirectory = path.dirname(file.name)
		if (fileDirectory.startsWith('\\') || fileDirectory.startsWith('/'))
			fileDirectory = fileDirectory.slice(1)
		const fileContents = fs.readFileSync(file.name, 'utf-8')
		const lines = fileContents.split(/\r?\n/)

		for (const line of lines) {
			if (containsImport(line.trim()) === -1) continue

			const importPath = getImportPath(line.trim())
			if (!isDirectPath(importPath)) continue

			const packagePath = findNearestNodeModules(fileDirectory, importPath)
			if (
				packagePath === '' ||
        packages.find((pkg) => pkg.name === packagePath)
			)
				continue

			packages.push({
				name: packagePath,
			})
		}
	})

	return packages
}

const containsImport = (line: string) => {
	return line.search(
		/^(import|export).*from\s+(['"]).*\2|.*require\s*\(\s*(['"]).*\3|.*CodeGraphy\s+connect:\s+(['"]).*\4/,
	)
}

const getImportPath = (line: string) => {
	const lineArr = line.replace('(', ' ').replace(')', ' ').split(' ')

	const index = lineArr.findIndex(
		(el) => el.startsWith('"') || el.startsWith('\''),
	)

	return lineArr[index].replace(/['"]+/g, '')
}

const isDirectPath = (importPath: string) => {
	return !importPath.startsWith('.')
}

const isValidDirectory = (path: string) => {
	try {
		if (fs.existsSync(path)) {
			const stats = fs.statSync(path)
			return stats.isDirectory()
		}
		return false
	} catch (error) {
		return false
	}
}

export const findNearestNodeModules = (
	directory: string,
	importPath: string,
) => {
	let result = ''
	let found = false

	let rootDirectory = vscode.workspace.workspaceFolders?.[0]?.uri?.path
		? path.normalize(vscode.workspace.workspaceFolders?.[0]?.uri?.path)
		: ''
	if (rootDirectory.startsWith('\\') || rootDirectory.startsWith('/'))
		rootDirectory = rootDirectory.slice(1)

	while (directory !== '' && !found && directory.startsWith(rootDirectory)) {
		const files = fs.readdirSync(directory)

		files.forEach((file) => {
			const filePath = path.join(directory, file)
			const stats = fs.statSync(filePath)

			if (stats.isDirectory() && file === 'node_modules') {
				const packagePath = path.join(directory, 'node_modules', importPath)

				if (isValidDirectory(packagePath)) {
					result = packagePath
					found = true
					return
				}
			}
		})

		directory = path.dirname(directory)
	}

	return result
}
