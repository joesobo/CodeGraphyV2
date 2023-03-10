import type { Connection, Directory, File } from './types'

export const fetchDirectoryConnections = (files: File[], dirs: Directory[]) => {
	const connections: Connection[] = []

	files.forEach((file, fileIndex) => {
		const filePathArray = file.name.split('/')
		filePathArray.pop()
		const fileDirectory = filePathArray.join('/')

		dirs.forEach((dir, dirIndex) => {
			if (fileDirectory === dir.name) {
				connections.push({
					id: `${fileIndex}-${dirIndex}`,
					source: fileIndex,
					target: dirIndex
				})
			}
		})
	})

	return connections
}
