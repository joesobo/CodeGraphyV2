import mockFs from 'mock-fs'
import { vi } from 'vitest'
import * as vscode from 'vscode'

import type { Node } from './types'

import fs from 'fs'

import { createFile } from './createFile'

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
		openTextDocument: vi.fn(),
	}

	const window = {
		showInformationMessage: vi.fn(),
		showErrorMessage: vi.fn(),
		showTextDocument: vi.fn(),
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
			file: vi.fn(),
		},
		Range: vi.fn(),
		Position: vi.fn(),
		commands: {
			executeCommand: vi.fn(),
		},
		WorkspaceEdit: vi.fn(),
	}
})

describe('createFile', () => {
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

	it('should create a new file under a folder if it does not exist', async () => {
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
		const newFileName = 'new-file.ts'

		await createFile(node, newFileName)

		const newFilePath = '/project/subdir/new-file.ts'
		expect(fs.existsSync(newFilePath)).toBeTruthy()
		expect(fs.readFileSync(newFilePath, 'utf8')).toEqual(
			`// CodeGraphy connect: './${node.name}'`,
		)
		expect(vscode.window.showErrorMessage).not.toHaveBeenCalled()
	})

	it('should create a new file next to a file if it does not exist', async () => {
		const node: Node = {
			id: 0,
			name: 'test3.ts',
			fullPath: '/project/subdir/test3.ts',
			radius: 10,
			depth: 2,
			favorite: false,
			collapsed: false,
			hidden: false,
			type: 'File',
			lines: 1,
		}
		const newFileName = 'test4.ts'

		await createFile(node, newFileName)

		const newFilePath = '/project/subdir/test4.ts'
		expect(fs.existsSync(newFilePath)).toBeTruthy()
		expect(fs.readFileSync(newFilePath, 'utf8')).toEqual(
			`// CodeGraphy connect: './${node.name}'`,
		)
		expect(vscode.window.showErrorMessage).not.toHaveBeenCalled()
	})

	it('should show an error message if the file already exists', async () => {
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
		const newFileName = 'file3.ts'

		await createFile(node, newFileName)

		const newFilePath = '/project/subdir/file3.ts'
		expect(fs.existsSync(newFilePath)).toBeTruthy()
		expect(fs.readFileSync(newFilePath, 'utf8')).not.toEqual(
			`// CodeGraphy connect: './${node.name}'`,
		)

		// Check if an error message was shown
		expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
			`File ${newFileName} already exists in ${node.fullPath}`,
		)
	})
})
