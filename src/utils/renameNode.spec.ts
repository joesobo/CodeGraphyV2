import mockFs from 'mock-fs'
import { vi } from 'vitest'
import * as vscode from 'vscode'

import type { Node } from './types'

import fs from 'fs'

import { renameNode } from './renameNode'

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
					update: vi.fn(),
				},
				update: vi.fn(),
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
		ConfigurationTarget: {
			Workspace: 'workspace',
		},
	}
})

describe('renameNode', () => {
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

	it('should rename a file', async () => {
		const node: Node = {
			id: 0,
			name: 'file1.ts',
			fullPath: '/project/file1.ts',
			radius: 10,
			depth: 2,
			favorite: false,
			collapsed: false,
			hidden: false,
			type: 'File',
			lines: 1,
		}

		const newNodeName = 'renamed-file1.ts'

		await renameNode(node, newNodeName)

		const newPath = '/project/renamed-file1.ts'
		expect(fs.existsSync(newPath)).toBeTruthy()
		expect(fs.existsSync(node.fullPath)).toBeFalsy()
		expect(vscode.window.showErrorMessage).not.toHaveBeenCalled()
	})

	it('should rename a directory', async () => {
		const node: Node = {
			id: 0,
			name: 'subdir',
			fullPath: '/project/subdir',
			radius: 10,
			depth: 1,
			favorite: false,
			collapsed: false,
			hidden: false,
			type: 'Directory',
			lines: 0,
		}
		const newNodeName = 'renamed-subdir'

		await renameNode(node, newNodeName)

		const newPath = '/project/renamed-subdir'
		expect(fs.existsSync(newPath)).toBeTruthy()
		expect(fs.existsSync(node.fullPath)).toBeFalsy()
		expect(vscode.window.showErrorMessage).not.toHaveBeenCalled()
	})

	it('should show an error message if the newPath already exists', async () => {
		const node: Node = {
			id: 0,
			name: 'file1.ts',
			fullPath: '/project/file1.ts',
			radius: 10,
			depth: 1,
			favorite: false,
			collapsed: false,
			hidden: false,
			type: 'File',
			lines: 1,
		}
		const newNodeName = 'file2.ts'

		await renameNode(node, newNodeName)

		expect(vscode.window.showErrorMessage).toHaveBeenCalled()
	})
})
