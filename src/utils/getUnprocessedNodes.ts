import { Directory, File, Package, UnprocessedNode } from './types'

export const getUnprocessedNodes = (
	files: File[],
	dirs: Directory[],
	packages: Package[],
) => {
	const unprocessedNodes: UnprocessedNode[] = []

	files.forEach((file) => {
		unprocessedNodes.push({
			type: 'File',
			data: file,
		})
	})

	dirs.forEach((dir) => {
		unprocessedNodes.push({
			type: 'Directory',
			data: dir,
		})
	})

	packages.forEach((pkg) => {
		unprocessedNodes.push({
			type: 'Package',
			data: pkg,
		})
	})

	return unprocessedNodes
}
