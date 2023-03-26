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

	it('creates valid nodes for the files, connections, and directories based on Interactions', async () => {
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

	it('creates valid nodes for the files, connections, and directories based on Directories', async () => {
		const result = await processData({
			openFile: null,
			path: '/project',
			nodeSize: 'Lines',
			nodeDepth: 0,
			blacklist: ['node_modules'],
			connectionMode: 'Directory',
			displayPackages: false,
		})

		const expectedNodes: Node[] = [
			{
				id: 0,
				name: 'subdir',
				fullPath: '/project/subdir',
				radius: 10.15
			},
			{ id: 1, name: 'project', fullPath: '/project', radius: 10.15 },
			{
				id: 2,
				name: 'file1.ts',
				fullPath: '/project/file1.ts',
				radius: 10.15,
				lines: 1,
			},
			{
				id: 3,
				name: 'file2.ts',
				fullPath: '/project/file2.ts',
				radius: 10.15,
				lines: 1,
			},
			{
				id: 4,
				name: 'file3.ts',
				fullPath: '/project/subdir/file3.ts',
				radius: 10.15,
				lines: 1,
			},
		]

		const expectedConnections: Connection[] = [
			// project -> file1
			{ id: '1-2', source: 1, target: 2 },
			// project -> file2
			{ id: '1-3', source: 1, target: 3 },
			// subdir -> file3
			{ id: '0-4', source: 0, target: 4 },
			// subdir -> project
			{ id: '0-1', source: 0, target: 1 }
		]

		expect(result.nodes).toEqual(expectedNodes)
		expect(result.connections).toEqual(expectedConnections)
	})
})

describe('processData with depth applied', () => {
	beforeEach(() => {
		// Mock file system
		mockFs({
			'/project': {
				'file1.ts': 'import file2 from "./file2"',
				'file2.ts': 'import file3 from "./subdir/file3"',
			},
			'/project/subdir': {
				'file3.ts': 'import test from "test"',
			},
		})
	})

	afterEach(() => {
		// Restore file system
		mockFs.restore()
	})

	it('creates the right connections and nodes with a depth applied', async () => {
		const result = await processData({
			openFile: '/project/file1.ts',
			path: '/project',
			nodeSize: 'Lines',
			nodeDepth: 1,
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
		]

		const expectedConnections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
		]

		expect(result.nodes).toEqual(expectedNodes)
		expect(result.connections).toEqual(expectedConnections)
	})

	it('creates the right connections and nodes with a depth applied of 2', async () => {
		const result = await processData({
			openFile: '/project/file1.ts',
			path: '/project',
			nodeSize: 'Lines',
			nodeDepth: 2,
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
		]

		expect(result.nodes).toEqual(expectedNodes)
		expect(result.connections).toEqual(expectedConnections)
	})

	it('creates the right connections and nodes with a depth applied, in Directories mode', async () => {
		const result = await processData({
			openFile: '/project/file1.ts',
			path: '/project',
			nodeSize: 'Lines',
			nodeDepth: 1,
			blacklist: ['node_modules'],
			connectionMode: 'Directory',
			displayPackages: false,
		})

		const expectedNodes: Node[] = [
			{
				id: 2,
				name: 'file1.ts',
				fullPath: '/project/file1.ts',
				radius: 10.15,
				lines: 1,
			},
			{
				id: 1,
				name: 'project',
				fullPath: '/project',
				radius: 10,
				lines: 0
			}
		]

		const expectedConnections: Connection[] = [
			// project -> file1
			{ id: '0-1', source: 0, target: 1 },
		]

		expect(result.nodes).toEqual(expectedNodes)
		expect(result.connections).toEqual(expectedConnections)
	})

	it('creates the right connections and nodes with a depth applied, in Directories mode, with depth of 2', async () => {
		const result = await processData({
			openFile: '/project/file1.ts',
			path: '/project',
			nodeSize: 'Lines',
			nodeDepth: 2,
			blacklist: ['node_modules'],
			connectionMode: 'Directory',
			displayPackages: false,
		})

		const expectedNodes: Node[] = [
			{
				id: 2,
				name: 'file1.ts',
				fullPath: '/project/file1.ts',
				radius: 10.15,
				lines: 1
			},
			{
				id: 1,
				name: 'project',
				fullPath: '/project',
				radius: 10,
				lines: 0
			},
			{
				id: 3,
				name: 'file2.ts',
				fullPath: '/project/file2.ts',
				radius: 10.15,
				lines: 1
			},
			{
				id: 0,
				name: 'subdir',
				fullPath: '/project/subdir',
				radius: 10,
				lines: 0
			}
		]

		const expectedConnections: Connection[] = [
			// subdir -> project
			{ id: '0-1', source: 0, target: 1 },
			// project -> file1
			{ id: '1-2', source: 1, target: 2 },
			// project -> file2
			{ id: '1-3', source: 1, target: 3 }
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
