import mockFs from 'mock-fs'

import type { File, Package } from './types'

import { getNodeModules } from './getNodeModules'

describe('getNodeModules', () => {
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

	it('should return the files and directories', () => {
		const files: File[] = [
			{ name: '/project/file1.ts', lines: 1 },
			{ name: '/project/file2.ts', lines: 1 },
			{ name: '/project/subdir/file3.ts', lines: 1 },
		]

		const result = getNodeModules({ files, mode: 'Interaction', showNodeModules: true })

		const expectedPackages: Package[] = [{ name: '/project/node_modules/vue' }]

		expect(result).toEqual(expectedPackages)
	})
})

describe('getNodeModules complex', () => {
	beforeEach(() => {
		// Mock file system
		mockFs({
			'/project': {
				'file1.ts': 'import file2 from "./file2"',
				'file2.ts': 'import file3 from "./subdir/file3"',
			},
			'/project/subdir': {
				'file3.ts': 'import { test } from "vue"',
				'file4.ts': 'import { test } from "vue"',
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

	it('should return the files and directories', () => {
		const files: File[] = [
			{ name: '/project/file1.ts', lines: 1 },
			{ name: '/project/file2.ts', lines: 1 },
			{ name: '/project/subdir/file3.ts', lines: 1 },
		]

		const result = getNodeModules({ files, mode: 'Interaction', showNodeModules: true })

		const expectedPackages: Package[] = [{ name: '/project/node_modules/vue' }]

		expect(result).toEqual(expectedPackages)
	})
})
