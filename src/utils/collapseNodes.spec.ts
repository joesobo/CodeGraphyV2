import type { Connection, Node } from './types'

import { collapseNodes } from './collapseNodes'

describe('collapseNodes', () => {
	it('should collapse nodes', () => {
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
				depth: 3,
				collapsed: false,
				hidden: false,
			},
		]

		const connections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '1-2', source: 1, target: 2 },
		]

		const result = collapseNodes({
			activeId: 0,
			collapseIds: [1],
			nodes,
			connections,
		})

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
				hidden: false,
			},
		]

		expect(result).toEqual(expectedNodes)
	})

	it('should toggle nodes back on', () => {
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

		const result = collapseNodes({
			activeId: 0,
			collapseIds: [1],
			nodes,
			connections,
		})

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
			{
				id: 3,
				name: 'file4.ts',
				fullPath: '/project/subdir/file4.ts',
				radius: 25,
				depth: 3,
				collapsed: false,
				hidden: false,
			},
		]

		expect(result).toEqual(expectedNodes)
	})

	it('should not collapse those connected to active', () => {
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
		]

		const connections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '1-2', source: 1, target: 2 },
			{ id: '0-2', source: 0, target: 2 },
		]

		const result = collapseNodes({
			activeId: 0,
			collapseIds: [1],
			nodes,
			connections,
		})

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
				fullPath: '/project/subdir/file3.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: false,
			},
		]

		expect(result).toEqual(expectedNodes)
	})

	it('should not collapse those connected to active but should still collapse other nodes', () => {
		const nodes: Node[] = [
			{
				id: 0,
				name: 'file4.ts',
				fullPath: '/project/subdir/file4.ts',
				radius: 25,
				depth: 1,
				collapsed: false,
				hidden: false,
			},
			{
				id: 1,
				name: 'file1.ts',
				fullPath: '/project/file1.ts',
				radius: 25,
				depth: 0,
				collapsed: false,
				hidden: false,
			},
			{
				id: 2,
				name: 'file2.ts',
				fullPath: '/project/file2.ts',
				radius: 25,
				depth: 1,
				collapsed: false,
				hidden: false,
			},
			{
				id: 3,
				name: 'file3.ts',
				fullPath: '/project/subdir/file3.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: false,
			},
		]

		const connections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '1-2', source: 1, target: 2 },
			{ id: '2-3', source: 2, target: 3 },
		]

		const result = collapseNodes({
			activeId: 1,
			collapseIds: [2],
			nodes,
			connections,
		})

		const expectedNodes: Node[] = [
			{
				id: 0,
				name: 'file4.ts',
				fullPath: '/project/subdir/file4.ts',
				radius: 25,
				depth: 1,
				collapsed: false,
				hidden: false,
			},
			{
				id: 1,
				name: 'file1.ts',
				fullPath: '/project/file1.ts',
				radius: 25,
				depth: 0,
				collapsed: false,
				hidden: false,
			},
			{
				id: 2,
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
				fullPath: '/project/subdir/file3.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: true,
			},
		]

		expect(result).toEqual(expectedNodes)
	})

	it('should be able to handle a complex graph', () => {
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
				fullPath: '/project/file3.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: false,
			},
			{
				id: 3,
				name: 'file4.ts',
				fullPath: '/project/file4.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: false,
			},
			{
				id: 4,
				name: 'file5.ts',
				fullPath: '/project/file5.ts',
				radius: 25,
				depth: 3,
				collapsed: false,
				hidden: false,
			},
			{
				id: 5,
				name: 'file6.ts',
				fullPath: '/project/file6.ts',
				radius: 25,
				depth: 3,
				collapsed: false,
				hidden: false,
			},
			{
				id: 6,
				name: 'file7.ts',
				fullPath: '/project/file7.ts',
				radius: 25,
				depth: 4,
				collapsed: false,
				hidden: false,
			},
		]

		const connections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '1-2', source: 1, target: 2 },
			{ id: '1-3', source: 1, target: 3 },
			{ id: '2-3', source: 2, target: 3 },
			{ id: '2-4', source: 2, target: 4 },
			{ id: '2-5', source: 2, target: 5 },
			{ id: '5-6', source: 5, target: 6 },
		]

		const result = collapseNodes({
			activeId: 0,
			collapseIds: [2],
			nodes,
			connections,
		})

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
				fullPath: '/project/file3.ts',
				radius: 25,
				depth: 2,
				collapsed: true,
				hidden: false,
			},
			{
				id: 3,
				name: 'file4.ts',
				fullPath: '/project/file4.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: false,
			},
			{
				id: 4,
				name: 'file5.ts',
				fullPath: '/project/file5.ts',
				radius: 25,
				depth: 3,
				collapsed: false,
				hidden: true,
			},
			{
				id: 5,
				name: 'file6.ts',
				fullPath: '/project/file6.ts',
				radius: 25,
				depth: 3,
				collapsed: false,
				hidden: true,
			},
			{
				id: 6,
				name: 'file7.ts',
				fullPath: '/project/file7.ts',
				radius: 25,
				depth: 4,
				collapsed: false,
				hidden: true,
			},
		]

		expect(result).toEqual(expectedNodes)
	})

	it('should handle toggling a complex back on', () => {
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
				fullPath: '/project/file3.ts',
				radius: 25,
				depth: 2,
				collapsed: true,
				hidden: false,
			},
			{
				id: 3,
				name: 'file4.ts',
				fullPath: '/project/file4.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: false,
			},
			{
				id: 4,
				name: 'file5.ts',
				fullPath: '/project/file5.ts',
				radius: 25,
				depth: 3,
				collapsed: false,
				hidden: true,
			},
			{
				id: 5,
				name: 'file6.ts',
				fullPath: '/project/file6.ts',
				radius: 25,
				depth: 3,
				collapsed: false,
				hidden: true,
			},
			{
				id: 6,
				name: 'file7.ts',
				fullPath: '/project/file7.ts',
				radius: 25,
				depth: 4,
				collapsed: false,
				hidden: true,
			},
		]

		const connections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '1-2', source: 1, target: 2 },
			{ id: '1-3', source: 1, target: 3 },
			{ id: '2-3', source: 2, target: 3 },
			{ id: '2-4', source: 2, target: 4 },
			{ id: '2-5', source: 2, target: 5 },
			{ id: '5-6', source: 5, target: 6 },
		]

		const result = collapseNodes({
			activeId: 0,
			collapseIds: [2],
			nodes,
			connections,
		})

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
				fullPath: '/project/file3.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: false,
			},
			{
				id: 3,
				name: 'file4.ts',
				fullPath: '/project/file4.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: false,
			},
			{
				id: 4,
				name: 'file5.ts',
				fullPath: '/project/file5.ts',
				radius: 25,
				depth: 3,
				collapsed: false,
				hidden: false,
			},
			{
				id: 5,
				name: 'file6.ts',
				fullPath: '/project/file6.ts',
				radius: 25,
				depth: 3,
				collapsed: false,
				hidden: false,
			},
			{
				id: 6,
				name: 'file7.ts',
				fullPath: '/project/file7.ts',
				radius: 25,
				depth: 4,
				collapsed: false,
				hidden: false,
			},
		]

		expect(result).toEqual(expectedNodes)
	})

	it('should handle collapsing with an already collapsed branch', () => {
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
				fullPath: '/project/file3.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: false,
			},
			{
				id: 3,
				name: 'file4.ts',
				fullPath: '/project/file4.ts',
				radius: 25,
				depth: 1,
				collapsed: false,
				hidden: false,
			},
			{
				id: 3,
				name: 'file5.ts',
				fullPath: '/project/file5.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: false,
			},
		]

		const connections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '1-2', source: 1, target: 2 },
			{ id: '0-3', source: 0, target: 3 },
			{ id: '3-4', source: 3, target: 4 },
		]

		const result = collapseNodes({
			activeId: 0,
			collapseIds: [1, 3],
			nodes,
			connections,
		})

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
				depth: 2,
				collapsed: true,
				hidden: false,
			},
			{
				id: 3,
				name: 'file4.ts',
				fullPath: '/project/file4.ts',
				radius: 25,
				depth: 1,
				collapsed: true,
				hidden: false,
			},
			{
				id: 3,
				name: 'file5.ts',
				fullPath: '/project/file5.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: true,
			},
		]

		expect(result).toEqual(expectedNodes)
	})

	it('should collapse all connected nodes when collapsing the active file', () => {
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
				fullPath: '/project/file3.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: false,
			},
			{
				id: 3,
				name: 'file4.ts',
				fullPath: '/project/file4.ts',
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

		const result = collapseNodes({
			activeId: 0,
			collapseIds: [0],
			nodes,
			connections,
		})

		const expectedNodes: Node[] = [
			{
				id: 0,
				name: 'file1.ts',
				fullPath: '/project/file1.ts',
				radius: 25,
				depth: 0,
				collapsed: true,
				hidden: false,
			},
			{
				id: 1,
				name: 'file2.ts',
				fullPath: '/project/file2.ts',
				radius: 25,
				depth: 1,
				collapsed: false,
				hidden: true,
			},
			{
				id: 2,
				name: 'file3.ts',
				fullPath: '/project/file3.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: true,
			},
			{
				id: 3,
				name: 'file4.ts',
				fullPath: '/project/file4.ts',
				radius: 25,
				depth: -1,
				collapsed: false,
				hidden: false,
			},
		]

		expect(result).toEqual(expectedNodes)
	})
})
