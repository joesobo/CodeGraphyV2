import readline from 'readline'
import fs from 'fs'
import { replaceAll } from './basic'

export type Connection = {
	id: string
	source: number
	target: number
}

let connectionCurrentPath: string
let sanitizedFiles: string[]

// Finds all connections for each file
export const fetchConnections = async (
	files: string[],
	currentPath: string
) => {
	let connections: Connection[] = []
	sanitizedFiles = sanitize(files)
	connectionCurrentPath = currentPath

	for (let index = 0; index < files.length; index++) {
		const filePath = files[index]
		const lineReader = readline.createInterface({
			input: fs.createReadStream(filePath)
		})

		const fileConnections = await findFileConnections(
			filePath,
			lineReader,
			index
		)

		if (fileConnections) {
			connections = connections.concat(fileConnections)
		}
	}

	return connections
}

const findFileConnections = async (
	filePath: string,
	lineReader: readline.Interface,
	fileIndex: number
) => {
	const currentFileConnections: Connection[] = []

	for await (let line of lineReader) {
		if (!containsConnection(line)) continue

		// cleans up connection line
		line = line.replace('(', ' ').replace(')', '').replace(';', '')

		const importPath = findImportPath(line)

		const connectionIndex = findConnectionIndex(importPath, filePath)

		if (connectionIndex !== -1) {
			currentFileConnections.push({
				id: fileIndex + '-' + connectionIndex,
				source: fileIndex,
				target: connectionIndex
			})
		}
	}

	return currentFileConnections
}

const containsConnection = (line: string) => {
	return (
		/^import.*(from.*("|').*("|')|"|')/.test(line) ||
		/.*require\(('|").*('|")\)/.test(line) ||
		/^export.*(from.*("|').*("|')|"|')/.test(line) ||
		/^export.*(from.*("|').*("|')|"|')/.test(line) ||
		/.*CodeGraphy connect: ('|").*.('|").*/.test(line)
	)
}

function findImportPath(line: string) {
	const lineArr = line.split(' ')
	const pathIndex = lineArr.findIndex(
		(el) => el.startsWith('"') || el.startsWith('\'')
	)

	return lineArr[pathIndex]
}

const sanitize = (files: string[]): string[] => {
	const santizedFiles: string[] = []

	files.forEach((file) => {
		let tempFile = replaceAll(file, ';', '')
		tempFile = replaceAll(tempFile, '"', '')

		santizedFiles.push(
			tempFile
		)
	})

	return santizedFiles
}

// cleans up the import path and returns its file index
function findConnectionIndex(importPath: string, filePath: string) {
	let foundIndex = -1
	let path = ''

	importPath = importPath.replace(/["']/g, '')

	// clean up path to search index
	if (importPath.startsWith('.')) {
		path = handleRelativePath(importPath, filePath)
	} else {
		path = handleDirectPath(importPath)
	}

	foundIndex = indexOfPath(sanitizedFiles, path)

	return foundIndex
}

// if a relative path, walk back from current file path
const handleRelativePath = (importPath: string, filePath: string) => {
	const relativePathArr = importPath.split('/')
	const tempPath = filePath.split('/')

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

const handleDirectPath = (importPath: string) => {
	return `${connectionCurrentPath}\\${importPath}`
}

const indexOfPath = (files: string[], testPath: string) => {
	const potentionIndices = []

	for (let index = 0; index < files.length; index++) {
		if (files[index].includes(testPath)) {
			potentionIndices.push(index)
		}
	}

	let bestIndex = -1
	let maxLength = 100
	potentionIndices.forEach((index) => {
		if (files[index].split('.').length < maxLength) {
			maxLength = files[index].split('.').length
			bestIndex = index
		}
	})

	return bestIndex
}
