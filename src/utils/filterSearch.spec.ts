import type { UnprocessedNode } from './types'

import { filterSearch } from './filterSearch'

describe('filterSearch', () => {
	it('should only return the shown nodes and connections', () => {
		const searchInput = 'test'

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
					name: '/project/test3.ts',
				},
			},
			{
				type: 'File',
				data: {
					name: '/project/test4.ts',
				},
			},
		]

		const result = filterSearch(nodes, searchInput)

		const expectedNodes: UnprocessedNode[] = [
			{
				type: 'File',
				data: {
					name: '/project/test3.ts',
				},
			},
			{
				type: 'File',
				data: {
					name: '/project/test4.ts',
				},
			},
		]

		expect(result).toEqual(expectedNodes)
	})

	it('should only return the shown nodes and connections in the appropriate dir', () => {
		const searchInput = '/subdir'

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
					name: '/project/subdir/test3.ts',
				},
			},
			{
				type: 'File',
				data: {
					name: '/project/subdir/test4.ts',
				},
			},
			{
				type: 'Directory',
				data: {
					name: '/project/subdir',
				},
			},
		]

		const result = filterSearch(nodes, searchInput)

		const expectedNodes: UnprocessedNode[] = [
			{
				type: 'File',
				data: {
					name: '/project/subdir/test3.ts',
				},
			},
			{
				type: 'File',
				data: {
					name: '/project/subdir/test4.ts',
				},
			},
			{
				type: 'Directory',
				data: {
					name: '/project/subdir',
				},
			},
		]

		expect(result).toEqual(expectedNodes)
	})
})
