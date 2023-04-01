import type { Connection, Node } from './types'

import { filterDepth } from './filterDepth'

describe('filterDepth', () => {
	it('should return all nodes and connections when depth is 0', () => {
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
				collapsed: false,
				hidden: false,
			},
			{
				id: 2,
				name: 'file3.ts',
				fullPath: '/project/subdir/file3.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: false,
			},
			{
				id: 3,
				name: 'vue',
				fullPath: '/project/node_modules/vue',
				radius: 10,
				depth: 3,
				collapsed: false,
				hidden: false,
			},
		]

		const connections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '1-2', source: 1, target: 2 },
			{ id: '2-3', source: 2, target: 3 },
		]

		const result = filterDepth({ nodes, connections, nodeDepth: 0 })

		expect(result.filteredNodes).toEqual(nodes)
		expect(result.filteredConnections).toEqual(connections)
	})

	it('should return filtered nodes and connections when depth is 1', () => {
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
				collapsed: false,
				hidden: false,
			},
			{
				id: 2,
				name: 'file3.ts',
				fullPath: '/project/subdir/file3.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: false,
			},
			{
				id: 3,
				name: 'file4.ts',
				fullPath: '/project/subdir/file4.ts',
				radius: 25,
				depth: -1,
				collapsed: false,
				hidden: false,
			},
			{
				id: 4,
				name: 'vue',
				fullPath: '/project/node_modules/vue',
				radius: 10,
				depth: 3,
				collapsed: false,
				hidden: false,
			},
		]

		const connections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '1-2', source: 1, target: 2 },
			{ id: '2-4', source: 2, target: 4 },
		]

		const result = filterDepth({ nodes, connections, nodeDepth: 1 })

		const expectedNodes: Node[] = [
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
				collapsed: false,
				hidden: false,
			},
		]

		const expectedConnections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
		]

		expect(result.filteredNodes).toEqual(expectedNodes)
		expect(result.filteredConnections).toEqual(expectedConnections)
	})
})
