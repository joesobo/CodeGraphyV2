import type { Connection, Node } from './types'

import { filterCollapsed } from './filterCollapsed'

describe('filterCollapsed', () => {
	it('should only return the shown nodes and connections', () => {
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
				name: 'file3.ts',
				fullPath: '/project/subdir/file3.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: true,
			},
			{
				id: 3,
				name: 'file4.ts',
				fullPath: '/project/subdir/file4.ts',
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

		const result = filterCollapsed(nodes, connections)

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
				collapsed: true,
				hidden: false,
			},
		]

		const expectedConnections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
		]

		expect(result.nodes).toEqual(expectedNodes)
		expect(result.connections).toEqual(expectedConnections)
	})
})
