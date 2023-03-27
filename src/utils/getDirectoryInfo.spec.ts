import mockFs from 'mock-fs'
import { vi } from 'vitest'

import type { Directory, File } from './types'

import { getDirectoryInfo } from './getDirectoryInfo'

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

describe('getDirectoryInfo', () => {
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

	it('should return the files', () => {
		const result = getDirectoryInfo('Interaction')

		const expectedFiles: File[] = [
			{ name: '/project/file1.ts', lines: 1 },
			{ name: '/project/file2.ts', lines: 1 },
			{ name: '/project/subdir/file3.ts', lines: 1 },
		]

		const expectedDirs: Directory[] = []

		expect(result.files).toEqual(expectedFiles)
		expect(result.dirs).toEqual(expectedDirs)
	})

	it('should return the files and directories', () => {
		const result = getDirectoryInfo('Directory')

		const expectedFiles: File[] = [
			{ name: '/project/file1.ts', lines: 1 },
			{ name: '/project/file2.ts', lines: 1 },
			{ name: '/project/subdir/file3.ts', lines: 1 },
		]

		const expectedDirs: Directory[] = [
			{ name: '/project' },
			{ name: '/project/subdir' },
		]

		expect(result.files).toEqual(expectedFiles)
		expect(result.dirs).toEqual(expectedDirs)
	})
})
