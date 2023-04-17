import mockFs from 'mock-fs'
import { vi } from 'vitest'
import * as vscode from 'vscode'

import type { Node } from './types'

import { copyPathToClipboard } from './copyPath'

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

	const env = {
		clipboard: {
			writeText: vi.fn(),
		},
	}

	return {
		workspace,
		window,
		env,
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

describe('copyPathToClipboard', () => {
	beforeEach(() => {
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

	it('should copy a path to the users clipboard', async () => {
		const node: Node = {
			id: 0,
			name: 'test3.ts',
			fullPath: '/project/subdir/test3.ts',
			radius: 10,
			depth: 2,
			favorite: false,
			collapsed: false,
			hidden: false,
			type: 'Directory',
			lines: 0,
		}

		// Clear previous calls
		await copyPathToClipboard(node.fullPath)

		expect(vscode.env.clipboard.writeText).toHaveBeenCalledTimes(1)
		expect(vscode.env.clipboard.writeText).toHaveBeenCalledWith(node.fullPath)
		expect(vscode.window.showInformationMessage).toHaveBeenCalledTimes(1)
		expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
			'File path copied to clipboard.',
		)
	})
})
