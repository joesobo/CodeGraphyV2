import fs from 'fs'
import path from 'path'

const files: string[] = []
const dirs: string[] = []

// returns a full list of files in a dir and its subdirs
export const fetchFiles = (
	directory: any
) => {
	try {
		const dirContent = fs.readdirSync(directory)

		dirContent.forEach((dirPath) => {
			const fullPath = path.join(directory, dirPath)

			if (fs.statSync(fullPath).isFile()) {
				files.push(fullPath)
			} else {
				dirs.push(fullPath)
			}
		})

		if (dirs.length !== 0) {
			fetchFiles(dirs.pop())
		}

		return files
	} catch (ex) {
		console.log(ex)
		return []
	}
}
