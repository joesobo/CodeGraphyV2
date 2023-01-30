import readline from 'readline'
import fs from 'fs'
import path from 'path'
import { containsBlacklist } from './blacklist'
import type { File } from './types'

const files: File[] = []
const dirs: string[] = []

// returns a full list of files in a dir and its subdirs
export const fetchFiles = (
	directory: any,
	blacklist: string[] = []
) => {
	try {
		const dirContent = fs.readdirSync(directory)

		dirContent.forEach(async (dirPath) => {
			const fullPath = path.join(directory, dirPath)

			if (containsBlacklist(fullPath, blacklist)) return

			if (fs.statSync(fullPath).isFile()) {
				let count = 0
				const lineReader = readline.createInterface({
					input: fs.createReadStream(fullPath)
				})

				for await (const _line of lineReader) {
					count++
				}

				files.push({ name: fullPath, lines: count })
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
