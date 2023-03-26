import type { Connection, Directory, File, Node } from './types'

import { getRandomInt } from './basic'
import { fetchConnections } from './fetchConnections'
import { fetchFiles } from './fetchFiles'

const MIN_RADIUS = 10
const MAX_RADIUS = 25

export const processData = async ({
	openFile,
	path,
	nodeSize,
	nodeDepth,
	blacklist,
	connectionMode,
	displayPackages,
}: {
  openFile: string | null
  path: string
  nodeSize: 'Lines' | 'Connections'
  nodeDepth: number
  blacklist: string[]
  connectionMode: 'Interaction' | 'Directory'
  displayPackages: boolean
}): Promise<{ nodes: Node[]; connections: Connection[] }> => {
	// get files and directories
	const fetchResult = fetchFiles(path, blacklist, true)
	const dirs = fetchResult.dirs
	let files = fetchResult.files

	// get connections
	const connectionResult = await fetchConnections({
		files,
		dirs,
		mode: connectionMode,
		displayPackages,
	})
	const connections = connectionResult.connections
	files = connectionResult.files

	let searchNodes: (File | Directory)[] = files
	if (connectionMode === 'Directory') {
		searchNodes = [...dirs, ...files]
	}

	const nodes: Node[] = []

	// local graph
	// TODO: clean this shit up brother
	if (nodeDepth > 0 && openFile) {
		const queue: { file: string; depth: number }[] = [
			{ file: openFile, depth: 0 },
		]
		const touchedConnections: Connection[] = []
		const touchedIndices: number[] = []

		while (queue.length > 0) {
			const current = queue.shift()!
			const currentFile = searchNodes.find((file) => file.name === current.file)

			if (currentFile) {
				const currentFilePath = currentFile.name.replace(/\\/g, '/')
				const currentFileName = currentFilePath.split('/').pop() || ''
				const fileIndex = searchNodes.findIndex(
					(file) => file.name === currentFile.name,
				)

				nodes.push({
					id: fileIndex,
					name: currentFileName,
					fullPath: currentFile.name,
					radius: getNodeSize(nodeSize, fileIndex, searchNodes, connections),
					lines: currentFile.lines,
				})
				touchedIndices.push(fileIndex)

				// find connections to current file
				connections.forEach((connection) => {
					const sourceIndex = connection.source
					const targetIndex = connection.target

					// set source or target to testing file
					if (sourceIndex === fileIndex || targetIndex === fileIndex) {
						let nonSelectedIndex = sourceIndex
						if (sourceIndex === fileIndex) {
							nonSelectedIndex = targetIndex
						}

						// push to queue if not already touched && depth is less than nodeDepth
						// Todo: if directory need to - dirs length?
						if (
							!touchedIndices.includes(nonSelectedIndex) &&
              current.depth < nodeDepth
						) {
							queue.push({
								file: searchNodes[nonSelectedIndex].name,
								depth: current.depth + 1,
							})

							const s = nodes.indexOf(
                nodes.find((node) => node.id === fileIndex)!,
							)
							const t = touchedConnections.length + 1

							touchedConnections.push({
								id: `${s}-${t}`,
								source: s,
								target: t,
							})
							touchedIndices.push(nonSelectedIndex)
						}
					}
				})
			}
		}

		return { nodes, connections: touchedConnections }
	}
	// global graph
	else {
		let nodeIndex = 0

		// push directory nodes
		if (dirs && connectionMode === 'Directory') {
			dirs.forEach((dir, dirIndex) => {
				const dirPath = dir.name.replace(/\\/g, '/')
				const dirName = dirPath.split('/').pop() || ''

				nodes.push({
					id: nodeIndex,
					name: dirName,
					fullPath: dir.name,
					radius: getNodeSize(nodeSize, dirIndex, files, connections),
				})
				nodeIndex++
			})
		}

		// push root nodes
		for (let index = 0; index < files.length; index++) {
			const file = files[index]
			const filePath = file.name.replace(/\\/g, '/')
			const fileName = filePath.split('/').pop() || ''

			nodes.push({
				id: nodeIndex + index,
				name: fileName,
				fullPath: file.name,
				radius: getNodeSize(nodeSize, index, files, connections),
				lines: file.lines,
			})
		}
		return { nodes, connections }
	}
}

// Find the Radius for the Node based on settings
const getNodeSize = (
	nodeSize: string,
	fileIndex: number,
	files: File[],
	connections: Connection[],
) => {
	const file = files[fileIndex]
	const MAX_LINES = getMaxLines(files)
	const MAX_CONNECTIONS = getMaxConnections(connections)

	let radius = getRandomInt(15) + 10

	if (nodeSize === 'Lines') {
		radius = MIN_RADIUS + ((MAX_RADIUS - MIN_RADIUS) * file.lines) / MAX_LINES
	} else if (nodeSize === 'Connections') {
		let connectionCount = 0

		connections.forEach((connection) => {
			if (connection.source === fileIndex || connection.target === fileIndex) {
				connectionCount++
			}
		})

		radius =
      MIN_RADIUS +
      ((MAX_RADIUS - MIN_RADIUS) * connectionCount) / MAX_CONNECTIONS
	}

	return radius
}

// Find the most lines in a file
const getMaxLines = (files: File[]) => {
	let MAX_LINES = 100
	files.forEach((file) => {
		if (file.lines > MAX_LINES) {
			MAX_LINES = file.lines
		}
	})
	return MAX_LINES
}

// Find the most connections in a file
const getMaxConnections = (connections: Connection[]) => {
	const connectionMap: number[] = []

	connections.forEach((connection) => {
		connectionMap[connection.source] = connectionMap[connection.source] + 1 || 1
		connectionMap[connection.target] = connectionMap[connection.target] + 1 || 1
	})

	let MAX_CONNECTIONS = 0
	connectionMap.forEach((value) => {
		if (value > MAX_CONNECTIONS) {
			MAX_CONNECTIONS = value
		}
	})

	return MAX_CONNECTIONS
}
