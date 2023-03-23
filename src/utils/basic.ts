import gen from 'random-seed'

export const replaceAll = (str: string, find: string, replace: string) => {
	return str.replace(new RegExp(find, 'g'), replace)
}

export const getRandomInt = (max: number) => {
	max = Math.floor(max)
	return Math.floor(Math.random() * max)
}

export const getRandomIntSeed = (seed: string, max: number) => {
	return gen.create(seed).intBetween(1, max)
}
