import mockFs from 'mock-fs'
import { vi } from 'vitest'

import type { Connection, Node, UnprocessedNode } from './types'

import { assignNodeDepth } from './assignNodeDepth'
import { filterNodesAndConnections } from './filterNodesAndConnections'
import { getConnections } from './getConnections'
import { getDirectoryInfo } from './getDirectoryInfo'
import { getNodeModules } from './getNodeModules'
import { getNodes } from './getNodes'
import { getUnprocessedNodes } from './getUnprocessedNodes'
import { processGraphInfo } from './processGraphInfo'

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

describe('getNodes', () => {
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

	it('should return the proper nodes and connections', () => {
		const mode: 'Interaction' | 'Directory' = 'Interaction'
		const nodeSize: 'Lines' | 'Connections' = 'Lines'
		const nodeDepth = 0
		const showNodeModules = true

		const { files, dirs } = getDirectoryInfo(mode)
		const packages = getNodeModules({ files, mode, showNodeModules })

		const unprocessedNodes: UnprocessedNode[] = getUnprocessedNodes(
			files,
			dirs,
			packages,
		)

		const connections = getConnections(unprocessedNodes, mode)
		let nodes = getNodes(unprocessedNodes, connections, nodeSize)

		nodes = assignNodeDepth(nodes, connections)

		const { filteredNodes, filteredConnections } = filterNodesAndConnections({
			nodes,
			connections,
			nodeDepth,
		})

		const expectedConnections: Connection[] = [
			{ id: '0-1', source: 0, target: 1 },
			{ id: '1-2', source: 1, target: 2 },
			{ id: '2-3', source: 2, target: 3 },
		]
		const expectedNodes: Node[] = [
			{
				id: 0,
				name: 'file1.ts',
				fullPath: '/project/file1.ts',
				radius: 25,
				depth: 0,
			},
			{
				id: 1,
				name: 'file2.ts',
				fullPath: '/project/file2.ts',
				radius: 25,
				depth: 1,
			},
			{
				id: 2,
				name: 'file3.ts',
				fullPath: '/project/subdir/file3.ts',
				radius: 25,
				depth: 2,
			},
			{
				id: 3,
				name: 'vue',
				fullPath: '/project/node_modules/vue',
				radius: 10,
				depth: 3,
			},
		]

		expect(filteredConnections).toEqual(expectedConnections)
		expect(filteredNodes).toEqual(expectedNodes)

		const { nodes: processedNodes, connections: processedConnections } =
      processGraphInfo({ mode, nodeSize, nodeDepth, showNodeModules })

		expect(processedConnections).toEqual(filteredConnections)
		expect(processedNodes).toEqual(filteredNodes)
	})
})
