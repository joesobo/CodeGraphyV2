import type { Connection, Directory, File } from './types'

export const fetchDirectoryConnections = (files: File[], dirs: Directory[]) => {
	const connections: Connection[] = []

	// Find connections between files and directories
	files.forEach((file, fileIndex) => {
		const filePathArray = file.name.split('/')
		filePathArray.pop()
		const fileDirectory = filePathArray.join('/')

		dirs.forEach((dir, dirIndex) => {
			if (fileDirectory === dir.name) {
				connections.push({
					id: `${dirIndex}-${fileIndex + dirs.length}`,
					source: dirIndex,
					target: fileIndex + dirs.length,
				})
			}
		})
	})

	// Find connections between directories
	dirs.forEach((dir, dirIndex) => {
		dirs.forEach((testDir, testDirIndex) => {
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
