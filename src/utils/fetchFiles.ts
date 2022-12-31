import fs from 'fs'
import path from 'path'
import { containsBlacklist } from './blacklist'

const files: string[] = []
const dirs: string[] = []

// returns a full list of files in a dir and its subdirs
export const fetchFiles = (
	directory: any,
	blacklist: string[] = []
) => {
	try {
		const dirContent = fs.readdirSync(directory)

		dirContent.forEach((dirPath) => {
			const fullPath = path.join(directory, dirPath)

			if (containsBlacklist(fullPath, blacklist)) return

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
