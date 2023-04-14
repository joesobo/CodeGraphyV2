import type { Connection, Node } from './types'

import { filterSearch } from './filterSearch'

describe('filterSearch', () => {
	it('should only return the shown nodes and connections', () => {
		const searchInput = 'test'

		const nodes: Node[] = [
			{
				id: 0,
				name: 'file1.ts',
				fullPath: '/project/file1.ts',
				radius: 25,
				depth: 0,
				collapsed: false,
				hidden: false,
			},
			{
				id: 1,
				name: 'file2.ts',
				fullPath: '/project/file2.ts',
				radius: 25,
				depth: 1,
				collapsed: true,
				hidden: false,
			},
			{
				id: 2,
				name: 'test3.ts',
				fullPath: '/project/subdir/test3.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: true,
			},
			{
				id: 3,
				name: 'test4.ts',
				fullPath: '/project/subdir/test4.ts',
				radius: 25,
				depth: 3,
				collapsed: false,
				hidden: true,
			},
		]

		const connections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '1-2', source: 1, target: 2 },
			{ id: '2-3', source: 2, target: 3 },
		]

		const result = filterSearch(nodes, connections, searchInput)

		const expectedNodes: Node[] = [
			{
				id: 2,
				name: 'test3.ts',
				fullPath: '/project/subdir/test3.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: true,
			},
			{
				id: 3,
				name: 'test4.ts',
				fullPath: '/project/subdir/test4.ts',
				radius: 25,
				depth: 3,
				collapsed: false,
				hidden: true,
			},
		]

		const expectedConnections: Connection[] = [
			{ id: '2-3', source: 2, target: 3 },
		]

		expect(result.nodes).toEqual(expectedNodes)
		expect(result.connections).toEqual(expectedConnections)
	})
})
