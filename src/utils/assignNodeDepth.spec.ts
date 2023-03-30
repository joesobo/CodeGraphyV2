import { vi } from 'vitest'

import type { Connection, Node } from './types'

import { assignNodeDepth } from './assignNodeDepth'

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
					blacklist: [],
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

describe('assignNodeDepth', () => {
	it('should return the files and directories', () => {
		const nodes: Node[] = [
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

		const connections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '1-2', source: 1, target: 2 },
			{ id: '2-3', source: 2, target: 3 },
		]

		const result = assignNodeDepth(nodes, connections)

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
				name: 'vue',
				fullPath: '/project/node_modules/vue',
				radius: 10,
				depth: 3,
				collapsed: false,
				hidden: false,
			},
		]

		expect(result).toEqual(expectedNodes)
	})
})
