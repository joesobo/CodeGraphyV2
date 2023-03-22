import type { Directory, File } from './types'

import fs from 'fs'
import path from 'path'
import readline from 'readline'

import { containsBlacklist } from './blacklist'

let dirs: string[] = []
let saveFiles: File[] = []
let saveDirs: Directory[] = []

// returns a full list of files in a dir and its subdirs
export const fetchFiles = async (
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
        const lineReader = readline.createInterface({
          input: fs.createReadStream(filePath),
        })

        lineReader.close()

        saveFiles.push({
          name: filePath,
          lines: fs.readFileSync(filePath, 'utf8').split('\n').length,
        })
      } else {
        dirs.push(filePath)
        saveDirs.push({ name: filePath })
      }
    }

    if (dirs.length !== 0) {
      await fetchFiles(dirs.pop() || '', blacklist)
    }

    saveDirs.push({ name: directory })

    if (init) {
      saveDirs = saveDirs.filter((dir, index, self) => {
        return index === self.findIndex((t) => t.name === dir.name)
      })
    }

    return { files: saveFiles, dirs: saveDirs }
  } catch (ex) {
    console.log(ex)
    return { files: [], dirs: [] }
  }
}
