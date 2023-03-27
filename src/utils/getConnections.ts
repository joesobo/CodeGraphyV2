import fs from 'fs'
import path from 'path'

import { Connection, UnprocessedNode } from './types'

export const getConnections = (
	unprocessedNodes: UnprocessedNode[],
	mode: 'Interaction' | 'Directory',
) => {
	let connections: Connection[] = []

	if (mode === 'Interaction') {
		connections = fetchInteractionConnections(unprocessedNodes)
	} else if (mode === 'Directory') {
		connections = fetchDirectoryConnections(unprocessedNodes)
	}

	return connections
}

const fetchInteractionConnections = (unprocessedNodes: UnprocessedNode[]) => {
	const connections: Connection[] = []

	unprocessedNodes.forEach((unprocessedNode, index) => {
		if (unprocessedNode.type !== 'File') return

		const file = unprocessedNode.data
		const fileContents = fs.readFileSync(file.name, 'utf-8')
		const lines = fileContents.split(/\r?\n/)

		for (const line of lines) {
			if (containsImport(line.trim()) === -1) continue

			const importPath = getImportPath(line.trim())
			const fullPath = getFullPath(file.name, importPath)
			const connectionIndex = findConnectionIndex(unprocessedNodes, fullPath)

			if (connectionIndex !== -1) {
				connections.push({
					id: index + '-' + connectionIndex,
					source: index,
					target: connectionIndex,
				})
			}
		}
	})

	return connections
}

const fetchDirectoryConnections = (unprocessedNodes: UnprocessedNode[]) => {
	const connections: Connection[] = []

	// Find connections between files and directories
	unprocessedNodes.forEach((node, nodeIndex) => {
		if (node.type === 'File') {
			const filePathArray = node.data.name.split('/')
			filePathArray.pop()
			const fileDirectory = filePathArray.join('/')

			unprocessedNodes.forEach((testNode, testIndex) => {
				if (
					testNode.type === 'Directory' &&
          testNode.data.name === fileDirectory
				) {
					connections.push({
						id: nodeIndex + '-' + testIndex,
						source: nodeIndex,
						target: testIndex,
					})
				}
			})
		} else if (node.type === 'Directory') {
			// look for a parent dir
			const dirPathArray = node.data.name.split('/')
			dirPathArray.pop()
			const searchParentDir = dirPathArray.join('/')

			unprocessedNodes.forEach((testNode, testIndex) => {
				if (
					testNode.type === 'Directory' &&
          testNode.data.name === searchParentDir
				) {
					connections.push({
						id: nodeIndex + '-' + testIndex,
						source: nodeIndex,
						target: testIndex,
					})
				}
			})
		}
	})

	return connections
}

const containsImport = (line: string) => {
	return line.search(
		/^(import|export).*from\s+(['"]).*\2|.*require\s*\(\s*(['"]).*\3|.*CodeGraphy\s+connect:\s+(['"]).*\4/,
	)
}

const getImportPath = (line: string) => {
	const lineArr = line.replace('(', ' ').split(' ')

	const index = lineArr.findIndex(
		(el) => el.startsWith('"') || el.startsWith('\''),
	)

	return lineArr[index].replace(/['"]+/g, '')
}

const getFullPath = (filePath: string, importPath: string) => {
	const directory = filePath.substring(1).split('/')
	const importPathArr = importPath.split('/')

	if (importPath.startsWith('.')) {
		if (importPath.startsWith('..')) {
			directory.pop()
		}

		importPathArr.forEach((element) => {
			if (element === '.' || element === '..') {
				directory.pop()
			} else {
				directory.push(element)
			}
		})
		return `/${directory.join('/')}`
	} else {
		directory.pop()
		return findNearestNodeModules(`/${directory.join('/')}` ?? '', importPath)
	}
}

const findConnectionIndex = (
	unprocessedNodes: UnprocessedNode[],
	fullImportPath: string,
) => {
	let result = -1

	unprocessedNodes.forEach((unprocessedNode, index) => {
		if (unprocessedNode.data.name.includes(fullImportPath)) {
			result = index
		}
	})

	return result
}

const findNearestNodeModules = (directory: string, importPath: string) => {
	let result = ''
	let found = false

	while (directory !== '' && !found) {
		const files = fs.readdirSync(directory)

		files.forEach((file) => {
			const filePath = path.join(directory, file)
			const stats = fs.statSync(filePath)

			if (stats.isDirectory() && file === 'node_modules') {
				const packagePath = path.join(directory, 'node_modules')
				const moduleFiles = fs.readdirSync(packagePath)

				moduleFiles.forEach((module) => {
					if (module !== importPath) return

					const modulePath = path.join(packagePath, module)
					const stats = fs.statSync(modulePath)

					if (stats.isDirectory()) {
						result = modulePath
						found = true
						return
					}
				})
			}
		})

		directory = directory.split('/').slice(0, -1).join('/')
	}

	return result
}
