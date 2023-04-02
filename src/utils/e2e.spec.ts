import mockFs from 'mock-fs'
import { vi } from 'vitest'

import type { Connection, Node, UnprocessedNode } from './types'

import { assignNodeDepth } from './assignNodeDepth'
import { collapseNodes } from './collapseNodes'
import { filterCollapsed } from './filterCollapsed'
import { filterDepth } from './filterDepth'
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
		const currentOpenFile = '/project/file1.ts'
		const collapseFullPaths: string[] = []
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

		const { filteredNodes, filteredConnections } = filterDepth({
			nodes,
			connections,
			nodeDepth,
		})
		const collapseIds = collapseFullPaths.map(
			(path) => filteredNodes.find((node) => node.fullPath === path)?.id ?? -1,
		)

		nodes = collapseNodes({
			activeId:
        filteredNodes.find((node) => node.fullPath === currentOpenFile)?.id ??
        -1,
			collapseIds,
			nodes: filteredNodes,
			connections: filteredConnections,
		})

		const result = filterCollapsed(nodes, filteredConnections)

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
				collapsed: false,
				hidden: false,
			},
			{
				id: 1,
				name: 'file2.ts',
				fullPath: '/project/file2.ts',
				radius: 25,
				depth: 1,
				collapsed: false,
				hidden: false,
			},
			{
				id: 2,
				name: 'file3.ts',
				fullPath: '/project/subdir/file3.ts',
				radius: 25,
				depth: 2,
				collapsed: false,
				hidden: false,
			},
			{
				id: 3,
				name: 'vue',
				fullPath: '/project/node_modules/vue',
				radius: 10,
				depth: 3,
				collapsed: false,
				hidden: false,
			},
		]

		expect(result.nodes).toEqual(expectedNodes)
		expect(result.connections).toEqual(expectedConnections)

		const { nodes: processedNodes, connections: processedConnections } =
      processGraphInfo({
      	mode,
      	nodeSize,
      	collapseFullPaths,
      	nodeDepth,
      	showNodeModules,
      })

		expect(processedNodes).toEqual(filteredNodes)
		expect(processedConnections).toEqual(filteredConnections)
	})
})
