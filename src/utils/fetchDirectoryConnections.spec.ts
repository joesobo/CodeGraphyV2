import type { Connection, Directory, File } from './types'

import { fetchDirectoryConnections } from './fetchDirectoryConnections'

describe('fetchDirectoryConnections', () => {
  it('should return an empty array if there are no files or directories', () => {
    expect(fetchDirectoryConnections([], [])).toEqual([])
  })

  it('should return an array of connections containing directories', () => {
    const dirs: Directory[] = [{ name: 'test' }, { name: 'abc' }]
    const files: File[] = [
      { name: 'test/test.js', lines: 0 },
      { name: 'test/test2.js', lines: 1 },
			{ name: 'abc/test3.js', lines: 2 },
    ]
    const expectedConnections: Connection[] = [
      { id: '0-2', source: 0, target: 2 },
      { id: '0-3', source: 0, target: 3 },
      { id: '1-4', source: 1, target: 4 },
    ]

    console.log(fetchDirectoryConnections(files, dirs))

    expect(fetchDirectoryConnections(files, dirs)).toEqual(expectedConnections)
  })
})
