import type { Directory, File } from './types'

import fs from 'fs'
import path from 'path'

import { containsBlacklist } from './blacklist'

let dirs: string[] = []
let saveFiles: File[] = []
let saveDirs: Directory[] = []

// returns a full list of files in a dir and its subdirs
export const fetchFiles = (
	directory: string,
	blacklist: string[] = [],
	init?: boolean,
) => {
	if (init) {
		saveFiles = []
		dirs = []
		saveDirs = []
	}

	try {
		const files = fs.readdirSync(directory)

		for (const file of files) {
			const filePath = path.join(directory, file)

			if (containsBlacklist(filePath, blacklist)) continue

			if (fs.statSync(filePath).isFile()) {
				const fileContents = fs.readFileSync(filePath, 'utf8')
				const lines = fileContents.split('\n').length

				saveFiles.push({
					name: filePath,
					lines: lines,
				})
			} else {
				dirs.push(filePath)
				saveDirs.push({ name: filePath, lines: 0 })
			}
		}

		if (dirs.length !== 0) {
			fetchFiles(dirs.pop() || '', blacklist)
		}

		saveDirs.push({ name: directory, lines: 0 })

		if (init) {
			saveDirs = saveDirs.filter((dir, index, self) => {
				return index === self.findIndex((t) => t.name === dir.name)
			})
		}

		return { files: saveFiles, dirs: saveDirs }
	} catch (ex) {
		console.log('Error fetching: ', ex)
		return { files: [], dirs: [] }
	}
}
