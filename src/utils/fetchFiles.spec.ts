import mockFs from 'mock-fs'

import type { Directory, File } from './types'

import { fetchFiles } from './fetchFiles'

describe('fetchFiles', () => {
	beforeEach(() => {
		// Mock file system
		mockFs({
			'/project': {
				'file1.ts': 'import file2 from "./file2"',
				'file2.ts': 'import file3 from "./subdir/file3"',
				'blacklisted.ts': 'This file should not be included in the results.',
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

	it('should return a list of files and directories without blacklisted files', () => {
		const blacklist = ['blacklisted.ts']

		const result = fetchFiles('/project', blacklist, true)

		const expectedFiles: File[] = [
			{ name: '/project/file1.ts', lines: 1 },
			{ name: '/project/file2.ts', lines: 1 },
			{ name: '/project/subdir/file3.ts', lines: 1 },
		]

		const expectedDirs: Directory[] = [
			{ name: '/project/subdir' },
			{ name: '/project' },
		]

		expect(result.files).toEqual(expectedFiles)
		expect(result.dirs).toEqual(expectedDirs)
	})

	it('should return a list of files and directories including blacklisted files when no blacklist is provided', () => {
		const result = fetchFiles('/project', [], true)

		const expectedFiles: File[] = [
			{ name: '/project/blacklisted.ts', lines: 1 },
			{ name: '/project/file1.ts', lines: 1 },
			{ name: '/project/file2.ts', lines: 1 },
			{ name: '/project/subdir/file3.ts', lines: 1 },
		]

		const expectedDirs: Directory[] = [
			{ name: '/project/subdir' },
			{ name: '/project' },
		]

		expect(result.files).toEqual(expectedFiles)
		expect(result.dirs).toEqual(expectedDirs)
	})
})
