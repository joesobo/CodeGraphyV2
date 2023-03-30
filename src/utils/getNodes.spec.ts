import mockFs from 'mock-fs'

import type { Connection, Node, UnprocessedNode } from './types'

import { getNodes } from './getNodes'

describe('getNodes', () => {
	beforeEach(() => {
		// Mock file system
		mockFs({
			'/project': {
				'file1.ts': 'import file2 from "./file2"',
				'file2.ts': 'import file3 from "./subdir/file3"',
			},
			'/project/subdir': {
				'file3.ts': 'import { test } from "vue"',
			},
			'/project/node_modules': {
				vue: {},
			},
		})
	})

	afterEach(() => {
		// Restore file system
		mockFs.restore()
	})

	it('should return the files and directories with Lines', () => {
		const unprocessedNodes: UnprocessedNode[] = [
			{ data: { name: '/project/file1.ts', lines: 1 }, type: 'File' },
			{ data: { name: '/project/file2.ts', lines: 1 }, type: 'File' },
			{ data: { name: '/project/subdir/file3.ts', lines: 1 }, type: 'File' },
			{ data: { name: '/project/node_modules/vue' }, type: 'Package' },
		]

		const connections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '1-2', source: 1, target: 2 },
			{ id: '2-3', source: 2, target: 3 },
		]

		const result = getNodes(unprocessedNodes, connections, 'Lines')

		const expectedNodes: Node[] = [
			{
				id: 0,
				name: 'file1.ts',
				fullPath: '/project/file1.ts',
				radius: 25,
				depth: -1,
				collapsed: false,
				hidden: false,
			},
			{
				id: 1,
				name: 'file2.ts',
				fullPath: '/project/file2.ts',
				radius: 25,
				depth: -1,
				collapsed: false,
				hidden: false,
			},
			{
				id: 2,
				name: 'file3.ts',
				fullPath: '/project/subdir/file3.ts',
				radius: 25,
				depth: -1,
				collapsed: false,
				hidden: false,
			},
			{
				id: 3,
				name: 'vue',
				fullPath: '/project/node_modules/vue',
				radius: 10,
				depth: -1,
				collapsed: false,
				hidden: false,
			},
		]

		expect(result).toEqual(expectedNodes)
	})

	it('should return the files and directories with Connections', () => {
		const unprocessedNodes: UnprocessedNode[] = [
			{ data: { name: '/project/file1.ts', lines: 1 }, type: 'File' },
			{ data: { name: '/project/file2.ts', lines: 1 }, type: 'File' },
			{ data: { name: '/project/subdir/file3.ts', lines: 1 }, type: 'File' },
			{ data: { name: '/project/node_modules/vue' }, type: 'Package' },
		]

		const connections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '1-2', source: 1, target: 2 },
			{ id: '2-3', source: 2, target: 3 },
		]

		const result = getNodes(unprocessedNodes, connections, 'Connections')

		const expectedNodes: Node[] = [
			{
				id: 0,
				name: 'file1.ts',
				fullPath: '/project/file1.ts',
				radius: 17.5,
				depth: -1,
				collapsed: false,
				hidden: false,
			},
			{
				id: 1,
				name: 'file2.ts',
				fullPath: '/project/file2.ts',
				radius: 25,
				depth: -1,
				collapsed: false,
				hidden: false,
			},
			{
				id: 2,
				name: 'file3.ts',
				fullPath: '/project/subdir/file3.ts',
				radius: 25,
				depth: -1,
				collapsed: false,
				hidden: false,
			},
			{
				id: 3,
				name: 'vue',
				fullPath: '/project/node_modules/vue',
				radius: 10,
				depth: -1,
				collapsed: false,
				hidden: false,
			},
		]

		expect(result).toEqual(expectedNodes)
	})
})
