
import fs from 'fs'
import path from 'path'

import { File, Package } from './types'

export const getNodeModules = ({files, mode, showNodeModules} : {
	files: File[],
	mode: 'Interaction' | 'Directory',
	showNodeModules: boolean,
}) => {
	if (!showNodeModules) return []
	if (mode === 'Directory') return []

	const packages: Package[] = []

	files.forEach((file) => {
		const fileDirectory = file.name.split('/').slice(0, -1).join('/')
		const fileContents = fs.readFileSync(file.name, 'utf-8')
		const lines = fileContents.split(/\r?\n/)

		for (const line of lines) {
			if (containsImport(line.trim()) === -1) continue

			const importPath = getImportPath(line.trim())
			if (!isDirectPath(importPath)) continue

			const packagePath = findNearestNodeModules(fileDirectory, importPath)
			if (packagePath === '' || packages.find((pkg) => pkg.name === packagePath))
				continue

			packages.push({
				name: packagePath,
			})
		}
	})

	return packages
}

const containsImport = (line: string) => {
	return line.search(
		/^(import|export).*from\s+(['"]).*\2|.*require\s*\(\s*(['"]).*\3|.*CodeGraphy\s+connect:\s+(['"]).*\4/,
	)
}

const getImportPath = (line: string) => {
	const lineArr = line.replace('(', ' ').replace(')', ' ').split(' ')

	const index = lineArr.findIndex(
		(el) => el.startsWith('"') || el.startsWith('\''),
	)

	return lineArr[index].replace(/['"]+/g, '')
}

const isDirectPath = (importPath: string) => {
	return !importPath.startsWith('.')
}

const findNearestNodeModules = (directory: string, importPath: string) => {
	let result = ''
	let found = false

	while (directory !== '' && !found) {
		const files = fs.readdirSync(directory)

		files.forEach((file) => {
			const filePath = path.join(directory, file)
			const stats = fs.statSync(filePath)

			if (stats.isDirectory() && file === 'node_modules') {
				const packagePath = path.join(directory, 'node_modules')
				const moduleFiles = fs.readdirSync(packagePath)

				moduleFiles.forEach((module) => {
					if (module !== importPath) return

					const modulePath = path.join(packagePath, module)
					const stats = fs.statSync(modulePath)

					if (stats.isDirectory()) {
						result = modulePath
						found = true
						return
					}
				})
			}
		})

		directory = directory.split('/').slice(0, -1).join('/')
	}

	return result
}
