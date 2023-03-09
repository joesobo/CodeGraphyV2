import type { File, Node } from './types'

import { getRandomInt } from './basic'

const MIN_RADIUS = 10
const MAX_RADIUS = 25
const MIN_LINES = 0

export const processData = (
	files: File[],
	nodeSize: string
) => {
	const nodes: Node[] = []
	const tempFiles: File[] = files

	// find the file with the most lines
	let MAX_LINES = 100
	tempFiles.forEach((file) => {
		if (file.lines > MAX_LINES) {
			MAX_LINES = file.lines
		}
	})

	// push root nodes
	for (let index = 0; index < tempFiles.length; index++) {
		const file = tempFiles[index]
		const filePath = file.name.replace(/\\/g, '/')
		const fileName = filePath.split('/').pop() || ''

		let radius = getRandomInt(15) + 10

		// calculate the radius based on the number of lines in the file
		if (nodeSize === 'Lines') {
			radius = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * (file.lines - MIN_LINES) / (MAX_LINES - MIN_LINES)
		}
		// else if (nodeSize === 'Connections') {

		// }

		nodes.push({
			id: index,
			name: fileName,
			fullPath: file.name,
			radius,
			lines: file.lines
		})
	}

	return nodes
}
