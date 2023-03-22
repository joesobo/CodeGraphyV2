import { containsBlacklist } from './blacklist'

describe('containsBlacklist', () => {
  it('should return true if the path contains a blacklist item', () => {
    expect(containsBlacklist('test', ['test'])).toBe(true)
  })

  it('should return false if the path does not contain a blacklist item', () => {
    expect(containsBlacklist('test', ['hello', '123', 'js', 'ts'])).toBe(false)
  })
})
