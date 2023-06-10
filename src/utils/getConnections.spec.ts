import mockFs from 'mock-fs'
import { vi } from 'vitest'

import type { Connection, UnprocessedNode } from './types'

import path from 'path'

import { getConnections } from './getConnections'

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

describe('getConnections', () => {
	beforeEach(() => {
		// Mock file system
		mockFs({
			[path.join('project')]: {
				[path.join('file1.ts')]: 'import file2 from "./file2"',
				[path.join('file2.ts')]: 'import file3 from "./subdir/file3"',
			},
			[path.join('project', 'subdir')]: {
				[path.join('file3.ts')]: 'import file1 from "../file1"',
			},
		})
	})

	afterEach(() => {
		// Restore file system
		mockFs.restore()
	})

	it('should return the connections Interaction', () => {
		const unprocessedNodes: UnprocessedNode[] = [
			{
				data: { name: path.join('project', 'file1.ts'), lines: 1 },
				type: 'File',
			},
			{
				data: { name: path.join('project', 'file2.ts'), lines: 1 },
				type: 'File',
			},
			{
				data: { name: path.join('project', 'subdir', 'file3.ts'), lines: 1 },
				type: 'File',
			},
		]

		const result = getConnections(unprocessedNodes, 'Interaction')

		const expectedConnections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '1-2', source: 1, target: 2 },
			{ id: '2-0', source: 2, target: 0 },
		]

		expect(result).toEqual(expectedConnections)
	})

	it('should return the connections Directory', () => {
		const unprocessedNodes: UnprocessedNode[] = [
			{
				data: { name: path.join('project', 'file1.ts'), lines: 1 },
				type: 'File',
			},
			{
				data: { name: path.join('project', 'file2.ts'), lines: 1 },
				type: 'File',
			},
			{
				data: { name: path.join('project', 'subdir', 'file3.ts'), lines: 1 },
				type: 'File',
			},
			{ data: { name: path.join('project') }, type: 'Directory' },
			{ data: { name: path.join('project', 'subdir') }, type: 'Directory' },
		]

		const result = getConnections(unprocessedNodes, 'Directory')

		const expectedConnections: Connection[] = [
			{ id: '0-3', source: 0, target: 3 },
			{ id: '1-3', source: 1, target: 3 },
			{ id: '2-4', source: 2, target: 4 },
			{ id: '4-3', source: 4, target: 3 },
		]

		expect(result).toEqual(expectedConnections)
	})
})

describe('getConnections Interaction node_modules', () => {
	beforeEach(() => {
		// Mock file system
		mockFs({
			[path.join('project')]: {
				[path.join('file1.ts')]: 'import file2 from "./file2"',
				[path.join('file2.ts')]: 'import file3 from "./subdir/file3"',
			},
			[path.join('project', 'node_modules')]: {
				vue: {},
			},
			[path.join('project', 'subdir')]: {
				[path.join('file3.ts')]: 'import test from "vue"',
			},
		})
	})

	afterEach(() => {
		// Restore file system
		mockFs.restore()
	})

	it('should return the connections', () => {
		const unprocessedNodes: UnprocessedNode[] = [
			{
				data: { name: path.join('project', 'file1.ts'), lines: 1 },
				type: 'File',
			},
			{
				data: { name: path.join('project', 'file2.ts'), lines: 1 },
				type: 'File',
			},
			{
				data: { name: path.join('project', 'subdir', 'file3.ts'), lines: 1 },
				type: 'File',
			},
			{
				data: { name: path.join('project', 'node_modules', 'vue') },
				type: 'Package',
			},
		]

		const result = getConnections(unprocessedNodes, 'Interaction')

		const expectedConnections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '1-2', source: 1, target: 2 },
			{ id: '2-3', source: 2, target: 3 },
		]

		expect(result).toEqual(expectedConnections)
	})
})
