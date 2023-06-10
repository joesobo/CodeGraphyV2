import { vi } from 'vitest'
import * as vscode from 'vscode'

import type { Node } from './types'

import { favoriteFile, isFavorite } from './favoriteFile'


let favorites: string[] = []

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
					favorites: favorites,
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

describe('favoriteFiles', () => {
	beforeEach(() => {
		favorites = []
	})

	it('should add a file to favorites', async () => {
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

		await favoriteFile(node)
		expect(isFavorite(node.fullPath)).toBeTruthy()
	})

	it('should remove a file from favorites', async () => {
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

		// Add the file to favorites
		await favoriteFile(node)
		expect(isFavorite(node.fullPath)).toBeTruthy()

		// Remove the file from favorites
		await favoriteFile(node)
		expect(isFavorite(node.fullPath)).toBeFalsy()
	})
})
