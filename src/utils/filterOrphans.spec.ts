import type { Connection, Node } from './types'

import { filterOrphans } from './filterOrphans'

describe('filterOrphans', () => {
	it('should remove an nodes with 0 connections', () => {
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
				fullPath: '/project/file3.ts',
				radius: 25,
				depth: -1,
				collapsed: false,
				hidden: false,
			},
		]

		const connections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '1-2', source: 1, target: 2 },
		]

		const result = filterOrphans(nodes, connections)

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
			{
				id: 2,
				name: 'file3.ts',
				fullPath: '/project/subdir/file3.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: false,
			},
		]

		console.log(result.nodes)

		expect(result.nodes).toEqual(expectedNodes)
		expect(result.connections).toEqual(connections)
	})
})
