import type { UnprocessedNode } from './types'

import { filterExtensions } from './filterExtensions'

describe('filterExtensions', () => {
	it('should only return the shown nodes and connections', () => {
		const extensionFilters = ['.ts']

		const nodes: UnprocessedNode[] = [
			{
				type: 'File',
				data: {
					name: '/project/file1.ts',
				},
			},
			{
				type: 'File',
				data: {
					name: '/project/file2.ts',
				},
			},
			{
				type: 'File',
				data: {
					name: '/project/file3.vue',
				},
			},
			{
				type: 'File',
				data: {
					name: '/project/file4.js',
				},
			},
		]

		const result = filterExtensions(nodes, extensionFilters)

		const expectedNodes: UnprocessedNode[] = [
			{
				type: 'File',
				data: {
					name: '/project/file1.ts',
				},
			},
			{
				type: 'File',
				data: {
					name: '/project/file2.ts',
				},
			},
		]

		expect(result).toEqual(expectedNodes)
	})
})
