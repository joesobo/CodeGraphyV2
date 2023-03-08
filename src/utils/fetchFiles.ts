import type { File } from './types'
import { containsBlacklist } from './blacklist'
import fs from 'fs'
import path from 'path'
import readline from 'readline'

const files: File[] = []
const dirs: string[] = []

// returns a full list of files in a dir and its subdirs
export const fetchFiles = async (
	directory: any,
	blacklist: string[] = []
): Promise<File[]> => {
	try {
		// mac directory fix
		const test = ('\\' + directory).replace(/\\/g, '/')

		const dirContent = fs.readdirSync(test)

		for (const dirPath of dirContent) {
			const fullPath = path.join(test, dirPath)

			if (containsBlacklist(fullPath, blacklist)) continue

			if (fs.statSync(fullPath).isFile()) {
				let count = 0
				const lineReader = readline.createInterface({
					input: fs.createReadStream(fullPath)
				})

				for await (const _line of lineReader) {
					count++
				}

				lineReader.close()

				files.push({ name: fullPath, lines: count })
			} else {
				dirs.push(fullPath)
			}
		}

		if (dirs.length !== 0) {
			await fetchFiles(dirs.pop(), blacklist)
		}

		return files
	} catch (ex) {
		console.log(ex)
		return []
	}
}
