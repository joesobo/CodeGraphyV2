import mockFs from 'mock-fs'

import type { Connection, Node } from './types'

import { processData } from './processData'

describe('processData', () => {
	beforeEach(() => {
		// Mock file system
		mockFs({
			'/project': {
				'file1.ts': 'import file2 from "./file2"',
				'file2.ts': 'import file3 from "./subdir/file3"',
			},
			'/project/subdir': {
				'file3.ts': 'import file1 from "../file1"',
			},
		})
	})

	afterEach(() => {
		// Restore file system
		mockFs.restore()
	})

	it('creates valid nodes for the files, connections, and directories', async () => {
		const result = await processData({
			openFile: null,
			path: '/project',
			nodeSize: 'Lines',
			nodeDepth: 0,
			blacklist: ['node_modules'],
			connectionMode: 'Interaction',
			displayPackages: false,
		})

		const expectedNodes: Node[] = [
			{
				id: 0,
				name: 'file1.ts',
				fullPath: '/project/file1.ts',
				radius: 10.15,
				lines: 1,
			},
			{
				id: 1,
				name: 'file2.ts',
				fullPath: '/project/file2.ts',
				radius: 10.15,
				lines: 1,
			},
			{
				id: 2,
				name: 'file3.ts',
				fullPath: '/project/subdir/file3.ts',
				radius: 10.15,
				lines: 1,
			},
		]

		const expectedConnections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '1-2', source: 1, target: 2 },
			{ id: '2-0', source: 2, target: 0 },
		]

		expect(result.nodes).toEqual(expectedNodes)
		expect(result.connections).toEqual(expectedConnections)
	})
})

describe('processData with node_modules', () => {
	beforeEach(() => {
		// Mock file system
		mockFs({
			'/root': {},
			'/root/project': {
				'file1.ts': 'import file2 from "./file2"',
				'file2.ts': 'import file3 from "./subdir/file3"',
			},
			'/root/project/node_modules/fake-test': {
				'test2.ts': '',
			},
			'/root/project/subdir': {
				'file3.ts': 'import { test } from "vue"',
			},
			'/root/node_modules/vue': {
				test: '',
			},
		})
	})

	afterEach(() => {
		// Restore file system
		mockFs.restore()
	})

	it('creates valid nodes for the files, connections, and directories', async () => {
		const result = await processData({
			openFile: null,
			path: '/root/project',
			nodeSize: 'Lines',
			nodeDepth: 0,
			blacklist: ['node_modules'],
			connectionMode: 'Interaction',
			displayPackages: true,
		})

		const expectedNodes: Node[] = [
			{
				id: 0,
				name: 'file1.ts',
				fullPath: '/root/project/file1.ts',
				radius: 10.15,
				lines: 1,
			},
			{
				id: 1,
				name: 'file2.ts',
				fullPath: '/root/project/file2.ts',
				radius: 10.15,
				lines: 1,
			},
			{
				id: 2,
				name: 'file3.ts',
				fullPath: '/root/project/subdir/file3.ts',
				radius: 10.15,
				lines: 1,
			},
			{
				id: 3,
				name: 'vue',
				fullPath: '/root/node_modules/vue',
				radius: 9.85,
				lines: -1,
			},
		]

		const expectedConnections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '1-2', source: 1, target: 2 },
			{ id: '2-3', source: 2, target: 3 },
		]

		expect(result.nodes).toEqual(expectedNodes)
		expect(result.connections).toEqual(expectedConnections)
	})
})
