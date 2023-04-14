import type { UnprocessedNode } from './types'

export const filterExtensions = (
	unprocessedNode: UnprocessedNode[],
	extensionFilters: string[],
) => {
	if (extensionFilters.length === 0) return unprocessedNode

	const filteredNodes: UnprocessedNode[] = unprocessedNode.filter((node) => {
		const extension = node.data.name.split('.').pop()

		if (!extension) return false
		return extensionFilters.includes(`.${extension}`)
	})

	return filteredNodes
}
