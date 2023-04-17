import mockFs from 'mock-fs'
import { vi } from 'vitest'
import * as vscode from 'vscode'

import type { Node } from './types'

import fs from 'fs'

import { createFolder } from './createFolder'

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

describe('createFolder', () => {
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

	it('should create a new folder if it does not exist', async () => {
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
		const newFolderName = 'new-folder'

		const newFolderPath = '/project/subdir/new-folder'

		await createFolder(node, newFolderName)

		expect(fs.existsSync(newFolderPath)).toBeTruthy()
		expect(vscode.window.showErrorMessage).not.toHaveBeenCalled()
	})

	it('should show an error message if the folder already exists', async () => {
		const node: Node = {
			id: 0,
			name: 'project',
			fullPath: '/project',
			radius: 10,
			depth: 1,
			favorite: false,
			collapsed: false,
			hidden: false,
			type: 'Directory',
			lines: 0,
		}
		const newFolderName = 'subdir'
		const newFolderPath = '/project/subdir'

		await createFolder(node, newFolderName)

		// Check if the folder exists
		expect(fs.existsSync(newFolderPath)).toBeTruthy()

		// Check if an error message was shown
		expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
			`File ${newFolderPath} already exists in ${node.fullPath}`,
		)
	})
})
