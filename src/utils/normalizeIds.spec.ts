import { normalizeIds } from './normalizeIds'
import { Connection, Node } from './types'

describe('normalizeIds', () => {
	it('should properly change the nodes and connections ids', () => {
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
				id: 3,
				name: 'file3.ts',
				fullPath: '/project/file3.ts',
				radius: 25,
				depth: 1,
				collapsed: false,
				hidden: false,
			},
			{
				id: 4,
				name: 'file4.ts',
				fullPath: '/project/file3.ts',
				radius: 25,
				depth: 1,
				collapsed: false,
				hidden: false,
			},
		]
		const connections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '0-3', source: 0, target: 3 },
			{ id: '3-4', source: 3, target: 4 },
		]

		const result = normalizeIds(nodes, connections)

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
			{
				id: 2,
				name: 'file3.ts',
				fullPath: '/project/file3.ts',
				radius: 25,
				depth: 1,
				collapsed: false,
				hidden: false,
			},
			{
				id: 3,
				name: 'file4.ts',
				fullPath: '/project/file3.ts',
				radius: 25,
				depth: 1,
				collapsed: false,
				hidden: false,
			},
		]
		const expectedConnections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '0-2', source: 0, target: 2 },
			{ id: '2-3', source: 2, target: 3 },
		]

		expect(result.nodes).toEqual(expectedNodes)
		expect(result.connections).toEqual(expectedConnections)
	})
})
