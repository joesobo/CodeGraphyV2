import { getRandomInt } from './basic'
import type { Node, File } from './types'

export const processData = (
	files: File[],
) => {
	const nodes: Node[] = []
	const tempFiles: File[] = files

	// push root nodes
	for (let index = 0; index < tempFiles.length; index++) {
		const file = tempFiles[index]
		const filePath = file.name.replace(/\\/g, '/')
		const fileName = filePath.split('/').pop() || ''
		nodes.push({
			id: index,
			name: fileName,
			fullPath: file.name,
			radius: getRandomInt(15) + 10,
			lines: file.lines
		})
	}

	return nodes
}
