import { findMaxDepth } from './depth'
import type { Connection } from './types'

describe('findMaxDepth', () => {
	it('should return 0 if there are no connections', () => {
		expect(findMaxDepth(undefined)).toBe(0)
	})

	it('should return the depth of the connections', () => {
		const connections: Connection[] = [
			{ source: 0, target: 1, id: '0-1' },
			{ source: 1, target: 2, id: '1-2' },
			{ source: 2, target: 3, id: '2-3' },
		]

		expect(findMaxDepth(connections)).toBe(2)
	})

	it('should return the longest depth count found', () => {
		const connections: Connection[] = [
			{ source: 0, target: 1, id: '0-1' },
			{ source: 1, target: 2, id: '1-2' },
			{ source: 2, target: 3, id: '2-3' },

			{ source: 4, target: 5, id: '4-5' },
			{ source: 5, target: 6, id: '5-6' },
			{ source: 6, target: 7, id: '6-7' },
			{ source: 7, target: 8, id: '7-8' },
		]

		expect(findMaxDepth(connections)).toBe(3)
	})
})
