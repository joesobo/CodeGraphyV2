import readline from 'readline'
import fs from 'fs'
import type { File, Connection } from './types'
import { replaceAll } from './basic'

let globalFiles: File[] = []
let globalPath = ''

// Finds all connections for each file
export const fetchConnections = async (
	files: File[],
	path: string
) => {
	let connections: Connection[] = []
	globalFiles = files
	globalPath = path

	// find connections for each file
	for (let index = 0; index < files.length; index++) {
		// finds the connections for the current file
		const fileConnections = await findFileConnections(
			index
		)

		if (fileConnections) {
			connections = connections.concat(fileConnections)
		}
	}

	return connections
}

// finds the connections for a single file
const findFileConnections = async (
	startIndex: number
) => {
	const file = globalFiles[startIndex].name
	const lineReader = readline.createInterface({
		input: fs.createReadStream(file)
	})

	const currentFileConnections: Connection[] = []

	for await (let line of lineReader) {
		if (findConnection(line) === -1) continue

		// cleans up connection line
		line = line.replace('(', ' ').replace(')', '').replace(';', '')

		// find the path of the file connected to
		const importPath = findImportPath(line)
		// find the index of that file in the files array
		const connectionIndex = findConnectionIndex(file, importPath)

		if (connectionIndex !== -1) {
			currentFileConnections.push({
				id: startIndex + '-' + connectionIndex,
				source: startIndex,
				target: connectionIndex
			})
		}
	}

	return currentFileConnections
}

const findConnection = (line: string) => {
	let result = -1

	result = line.search(/^import.*from.*("|').*("|')/)
	result = result === -1 ? line.search(/.*require(('|").*('|"))/) : result
	result = result === -1 ? line.search(/^export.*from.*("|').*("|')/) : result
	result = result === -1 ? line.search(/.*CodeGraphy connect: ('|").*.('|").*/) : result
	return result
}

const findImportPath = (line: string) => {
	const lineArr = line.split(' ')

	const index = lineArr.findIndex(
		(el) => el.startsWith('"') || el.startsWith('\'')
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
	path = replaceAll(path, '/', '\\')

	foundIndex = indexOfPath(path)

	return foundIndex
}

// if a relative path, walk back from current file path
const handleRelativePath = (importPath: string, filePath: string) => {
	const relativePathArr = importPath.split('/')
	const tempPath = filePath.split('\\')

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
