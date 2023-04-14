import type { UnprocessedNode } from './types'

export const filterSearch = (
	unprocessedNode: UnprocessedNode[],
	searchInput: string,
) => {
	if (searchInput === undefined) return unprocessedNode

	const filteredNodes: UnprocessedNode[] = unprocessedNode.filter((node) => {
		const nodePath = node.data.name.replace(/\\/g, '/')
		let nodeFullPath = nodePath.split('/').pop() || ''

		if (node.type === 'Package') {
			nodeFullPath = nodePath.split('node_modules/')?.pop() || ''
		}

		let search = searchInput.toLowerCase()

		if (search.startsWith('/')) {
			search = search.replace('/', '')
			return node.data.name.toLowerCase().includes(search)
		} else {
			return nodeFullPath.toLowerCase().includes(search)
		}
	})

	return filteredNodes
}
