import mockFs from 'mock-fs'
import { vi } from 'vitest'
import * as vscode from 'vscode'

import type { Node } from './types'

import fs from 'fs'

import { deleteNode } from './deleteNode'

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

describe('deleteNode', () => {
	beforeEach(() => {
		mockFs({
			'/project': {
				'file1.ts': 'import file2 from "./file2"',
				'file2.ts': 'import file3 from "./subdir/file3"',
			},
			'/project/subdir': {
				'file3.ts': 'import { test } from "vue"',
			},
		})
	})

	afterEach(() => {
		// Restore file system
		mockFs.restore()
	})

	it('should delete a file', async () => {
		const node: Node = {
			id: 0,
			name: 'file3.ts',
			fullPath: '/project/subdir/file3.ts',
			radius: 25,
			depth: 2,
			favorite: false,
			collapsed: false,
			hidden: false,
			type: 'File',
			lines: 1,
		}

		await deleteNode(node)

		expect(fs.existsSync(node.fullPath)).toBeFalsy()
		expect(vscode.window.showErrorMessage).not.toHaveBeenCalled()
	})

	it('should delete a folder', async () => {
		const node: Node = {
			id: 0,
			name: 'subdir',
			fullPath: '/project/subdir',
			radius: 10,
			depth: 2,
			favorite: false,
			collapsed: false,
			hidden: false,
			type: 'Directory',
			lines: 0,
		}

		await deleteNode(node)

		expect(fs.existsSync(node.fullPath)).toBeFalsy()
		expect(fs.existsSync('/project/subdir/test3.ts')).toBeFalsy()
		expect(vscode.window.showErrorMessage).not.toHaveBeenCalled()
	})
})
