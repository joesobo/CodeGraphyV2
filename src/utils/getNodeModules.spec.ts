import mockFs from 'mock-fs'
import { vi } from 'vitest'

import type { File, Package } from './types'

import path from 'path'

import { getNodeModules } from './getNodeModules'

vi.mock('vscode', () => {
	const workspace = {
		workspaceFolders: [
			{
				uri: {
					path: 'project',
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

describe('getNodeModules', () => {
	beforeEach(() => {
		// Mock file system
		mockFs({
			[path.join('project')]: {
				'file1.ts': 'import file2 from "./file2"',
				'file2.ts': 'import file3 from "./subdir/file3"',
			},
			[path.join('project', 'subdir')]: {
				'file3.ts': 'import { test } from "vue"',
			},
			[path.join('project', 'node_modules')]: {
				vue: {},
			},
		})
	})

	afterEach(() => {
		// Restore file system
		mockFs.restore()
	})

	it('should return the files and directories', () => {
		const files: File[] = [
			{ name: path.join('project', 'file1.ts'), lines: 1 },
			{ name: path.join('project', 'file2.ts'), lines: 1 },
			{ name: path.join('project', 'subdir', 'file3.ts'), lines: 1 },
		]

		const result = getNodeModules({
			files,
			mode: 'Interaction',
			showNodeModules: true,
		})

		const expectedPackages: Package[] = [{ name: path.join('project', 'node_modules', 'vue') }]

		expect(result).toEqual(expectedPackages)
	})
})

describe('getNodeModules complex', () => {
	beforeEach(() => {
		// Mock file system
		mockFs({
			[path.join('project')]: {
				'file1.ts': 'import file2 from "./file2"',
				'file2.ts': 'import file3 from "./subdir/file3"',
			},
			[path.join('project', 'subdir')]: {
				'file3.ts': 'import { test } from "vue"',
				'file4.ts': 'import { test } from "vue"',
			},
			[path.join('project', 'node_modules')]: {
				vue: {},
			},
		})
	})

	afterEach(() => {
		// Restore file system
		mockFs.restore()
	})

	it('should return the files and directories', () => {
		const files: File[] = [
			{ name: path.join('project', 'file1.ts'), lines: 1 },
			{ name: path.join('project', 'file2.ts'), lines: 1 },
			{ name: path.join('project', 'subdir', 'file3.ts'), lines: 1 },
		]

		const result = getNodeModules({
			files,
			mode: 'Interaction',
			showNodeModules: true,
		})

		const expectedPackages: Package[] = [{ name: path.join('project', 'node_modules', 'vue') }]

		expect(result).toEqual(expectedPackages)
	})
})
