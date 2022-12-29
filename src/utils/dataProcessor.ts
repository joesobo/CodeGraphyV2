import { getRandomInt } from './basic'

export const processData = (
	files: string[],
) => {
	const nodes: any[] = []
	const tempFiles: string[] = files

	// push root nodes
	for (let index = 0; index < tempFiles.length; index++) {
		const file = tempFiles[index]
		const filePath = file.replace(/\\/g, '/')
		const fileName = filePath.split('/').pop() || ''
		nodes.push({
			id: index,
			name: fileName,
			fullPath: file,
			radius: getRandomInt(15) + 10,
			category: getRandomInt(3)
		})
	}

	return nodes
}
