import type { Connection, Directory, File } from './types'

import fs from 'fs'
import readline from 'readline'

let globalFiles: File[] = []
let globalDirs: Directory[] = []
let globalPath = ''

export const fetchConnections = async ({
	files,
	dirs,
	path,
	mode,
}: {
  files: File[]
  path: string
  dirs: Directory[]
  mode: 'Interaction' | 'Directory'
}): Promise<Connection[]> => {
	let connections: Connection[] = []
	globalFiles = files
	globalDirs = dirs
	globalPath = path

	if (mode === 'Interaction') {
		connections = await fetchInteractionConnections()
	} else if (mode === 'Directory') {
		connections = fetchDirectoryConnections()
	}

	return connections
}

// Finds all connections for each file based on their contents
const fetchInteractionConnections = async () => {
	let connections: Connection[] = []

	// Find connections for each file
	for (let index = 0; index < globalFiles.length; index++) {
		const fileConnections = await findFileConnections(index)

		if (fileConnections) {
			connections = connections.concat(fileConnections)
		}
	}

	return connections
}

const fetchDirectoryConnections = () => {
	const connections: Connection[] = []

	// Find connections between files and directories
	globalFiles.forEach((file, fileIndex) => {
		const filePathArray = file.name.split('/')
		filePathArray.pop()
		const fileDirectory = filePathArray.join('/')

		globalDirs.forEach((dir, dirIndex) => {
			if (fileDirectory === dir.name) {
				connections.push({
					id: `${dirIndex}-${fileIndex + globalDirs.length}`,
					source: dirIndex,
					target: fileIndex + globalDirs.length,
				})
			}
		})
	})

	// Find connections between directories
	globalDirs.forEach((dir, dirIndex) => {
		globalDirs.forEach((testDir, testDirIndex) => {
			if (dir.name.includes(testDir.name) && dir.name !== testDir.name) {
				connections.push({
					id: `${dirIndex}-${testDirIndex}`,
					source: dirIndex,
					target: testDirIndex,
				})
			}
		})
	})

	return connections
}

// Finds the connections for a single file based on its contents
const findFileConnections = async (startIndex: number) => {
	const file = globalFiles[startIndex].name
	const lineReader = readline.createInterface({
		input: fs.createReadStream(file),
	})

	const currentFileConnections: Connection[] = []

	// Read each line of the file
	for await (let line of lineReader) {
		if (findConnection(line.trim()) === -1) continue

		// Clean up connection line
		line = line.trim().replace('(', ' ').replace(')', '').replace(';', '')

		// Find the path of the file connected to
		const importPath = findImportPath(line)
		// Find the index of that file in the files array
		const connectionIndex = findConnectionIndex(file, importPath)

		if (connectionIndex !== -1) {
			currentFileConnections.push({
				id: startIndex + '-' + connectionIndex,
				source: startIndex,
				target: connectionIndex,
			})
		}
	}

	return currentFileConnections
}

// Returns the index of the connection if found, -1 if not
const findConnection = (line: string) => {
	return line.search(
		/^(import|export).*from\s+(['"]).*\2|.*require\s*\(\s*(['"]).*\3|.*CodeGraphy\s+connect:\s+(['"]).*\4/,
	)
}

const findImportPath = (line: string) => {
	const lineArr = line.split(' ')

	const index = lineArr.findIndex(
		(el) => el.startsWith('"') || el.startsWith('\''),
	)

	return lineArr[index]
}

// cleans up the import path and returns its file index
const findConnectionIndex = (file: string, importPath: string) => {
	let foundIndex = -1
	let path = ''

	// clean up path to search index
	importPath = importPath.replace(/["']/g, '')
	if (importPath.startsWith('.')) {
		path = handleRelativePath(importPath, file)
	} else {
		path = handleDirectPath(importPath)
	}

	foundIndex = indexOfPath(path)

	return foundIndex
}

// if a relative path, walk back from current file path
const handleRelativePath = (importPath: string, filePath: string) => {
	const relativePathArr = importPath.split('/')
	const tempPath = filePath.split(/[\\/]+/)

	if (importPath.startsWith('..')) {
		tempPath.pop()
	}

	relativePathArr.forEach((element) => {
		if (element === '.' || element === '..') {
			tempPath.pop()
		} else {
			tempPath.push(element)
		}
	})

	return tempPath.join('/')
}

// if a direct path, add the global path to the beginning
const handleDirectPath = (importPath: string) => {
	return `${globalPath}\\${importPath}`
}

// finds the index of the path in the global files array
const indexOfPath = (testPath: string) => {
	const potentialIndices = []

	for (let index = 0; index < globalFiles.length; index++) {
		if (globalFiles[index].name.includes(testPath)) {
			potentialIndices.push(index)
		}
	}

	// TEMP solution for multiple files with the same or similar names (currently returns the shortest path)
	let bestIndex = -1
	let maxLength = 100
	potentialIndices.forEach((index) => {
		if (globalFiles[index].name.split('.').length < maxLength) {
			maxLength = globalFiles[index].name.split('.').length
			bestIndex = index
		}
	})

	return bestIndex
}
