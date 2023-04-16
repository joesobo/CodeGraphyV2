import mockFs from 'mock-fs'
import { vi } from 'vitest'

import type { Connection, Node, UnprocessedNode } from './types'

import { getNodes } from './getNodes'

vi.mock('vscode', () => {
	const workspace = {
		workspaceFolders: [
			{
				uri: {
					path: '/project',
				},
			},
		],
		getConfiguration: vi.fn().mockImplementation(() => {
			return {
				codegraphy: {
					favorites: [],
				},
			}
		}),
		onDidChangeConfiguration: vi.fn(),
	}

	const window = {
		showInformationMessage: vi.fn(),
		showErrorMessage: vi.fn(),
		activeTextEditor: {
			document: {
				fileName: '/project/file1.ts',
			},
		},
	}

	return {
		workspace,
		window,
		Uri: {
			parse: vi.fn(),
		},
		Range: vi.fn(),
		Position: vi.fn(),
		commands: {
			executeCommand: vi.fn(),
		},
		WorkspaceEdit: vi.fn(),
	}
})

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
				favorite: false,
				collapsed: false,
				hidden: false,
				type: 'File',
				lines: 1,
			},
			{
				id: 1,
				name: 'file2.ts',
				fullPath: '/project/file2.ts',
				radius: 25,
				depth: -1,
				favorite: false,
				collapsed: false,
				hidden: false,
				type: 'File',
				lines: 1,
			},
			{
				id: 2,
				name: 'file3.ts',
				fullPath: '/project/subdir/file3.ts',
				radius: 25,
				depth: -1,
				favorite: false,
				collapsed: false,
				hidden: false,
				type: 'File',
				lines: 1,
			},
			{
				id: 3,
				name: 'vue',
				fullPath: '/project/node_modules/vue',
				radius: 10,
				depth: -1,
				collapsed: false,
				hidden: false,
				type: 'Package',
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
				favorite: false,
				collapsed: false,
				hidden: false,
				type: 'File',
				lines: 1,
			},
			{
				id: 1,
				name: 'file2.ts',
				fullPath: '/project/file2.ts',
				radius: 25,
				depth: -1,
				favorite: false,
				collapsed: false,
				hidden: false,
				type: 'File',
				lines: 1,
			},
			{
				id: 2,
				name: 'file3.ts',
				fullPath: '/project/subdir/file3.ts',
				radius: 25,
				depth: -1,
				favorite: false,
				collapsed: false,
				hidden: false,
				type: 'File',
				lines: 1,
			},
			{
				id: 3,
				name: 'vue',
				fullPath: '/project/node_modules/vue',
				radius: 10,
				depth: -1,
				collapsed: false,
				hidden: false,
				type: 'Package',
			},
		]

		expect(result).toEqual(expectedNodes)
	})
})
