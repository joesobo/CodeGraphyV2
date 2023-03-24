import mockFs from 'mock-fs'

import type { Connection, Directory, File } from './types'

import { fetchConnections } from './fetchConnections'

describe('fetchConnections', () => {
	const files: File[] = [
		{ name: '/project/file1.ts', lines: 0 },
		{ name: '/project/file2.ts', lines: 1 },
		{ name: '/project/subdir/file3.ts', lines: 2 },
	]

	const dirs: Directory[] = [{ name: '/project' }, { name: '/project/subdir' }]

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

	it('should return connections when mode is Interaction', async () => {
		const result = (
			await fetchConnections({
				files,
				dirs,
				mode: 'Interaction',
				displayPackages: false,
			})
		).connections

		// Replace the expected connections array with the expected output.
		const expectedConnections: Connection[] = [
			// files1.ts -> file2.ts
			{
				id: '0-1',
				source: 0,
				target: 1,
			},
			// file2.ts -> file3.ts
			{
				id: '1-2',
				source: 1,
				target: 2,
			},
			// file3.ts -> file1.ts
			{
				id: '2-0',
				source: 2,
				target: 0,
			},
		]

		expect(result).toEqual(expectedConnections)
	})

	it('should return connections when mode is Directory', async () => {
		const result = (
			await fetchConnections({
				files,
				dirs,
				mode: 'Directory',
				displayPackages: false,
			})
		).connections

		const expectedConnections: Connection[] = [
			// project -> file1.ts
			{ id: '0-2', source: 0, target: 2 },
			// project -> file2.ts
			{ id: '0-3', source: 0, target: 3 },
			// subdir -> file3.ts
			{ id: '1-4', source: 1, target: 4 },
			// subdir -> project
			{ id: '1-0', source: 1, target: 0 },
		]

		expect(result).toEqual(expectedConnections)
	})
})

describe('fetchConnections with node_modules', () => {
	const files: File[] = [
		{ name: '/root/project/file1.ts', lines: 0 },
		{ name: '/root/project/file2.ts', lines: 1 },
		{ name: '/root/project/subdir/file3.ts', lines: 2 },
	]

	const dirs: Directory[] = [
		{ name: '/root/project' },
		{ name: '/root/project/subdir' },
	]

	beforeEach(() => {
		// Mock file system
		mockFs({
			'/root': {},
			'/root/project': {
				'file1.ts': 'import file2 from "./file2"',
				'file2.ts': 'import file3 from "./subdir/file3"',
			},
			'/root/project/node_modules/fake-test': {
				test2: '',
			},
			'/root/project/subdir': {
				'file3.ts': 'import { test } from "vue"',
			},
			'/root/node_modules/vue': {
				test: '',
			},
		})
	})

	afterEach(() => {
		// Restore file system
		mockFs.restore()
	})

	it('should return interaction connections with node_modules', async () => {
		const result = await fetchConnections({
			files,
			dirs,
			mode: 'Interaction',
			displayPackages: true,
		})
		const connectionResult = result.connections

		// Replace the expected connections array with the expected output.
		const expectedConnections: Connection[] = [
			// files1.ts -> file2.ts
			{
				id: '0-1',
				source: 0,
				target: 1,
			},
			// file2.ts -> file3.ts
			{
				id: '1-2',
				source: 1,
				target: 2,
			},
			// file3.ts -> Vue
			{
				id: '2-3',
				source: 2,
				target: 3,
			},
		]

		expect(connectionResult).toEqual(expectedConnections)
	})
})
