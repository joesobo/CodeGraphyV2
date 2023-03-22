import { getRandomInt, getRandomIntSeed, replaceAll } from './basic'

describe('basic', () => {
	describe('replaceAll', () => {
		it('should replace all instances of a string', () => {
			expect(replaceAll('test test2 test world', 'test', 'hello')).toBe('hello hello2 hello world')
		})
	})

	describe('getRandomInt', () => {
		it('should return a random number', () => {
			expect(getRandomInt(10)).toBeGreaterThanOrEqual(0)
			expect(getRandomInt(10)).toBeLessThan(10)
		})
	})

	describe('getRandomIntSeed', () => {
		it('should return a random number', () => {
			expect(getRandomIntSeed('test', 10)).toBeGreaterThanOrEqual(0)
			expect(getRandomIntSeed('test', 10)).toBeLessThan(10)
			expect(getRandomIntSeed('test', 10)).toEqual(getRandomIntSeed('test', 10))
		})
	})
})
