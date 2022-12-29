export const replaceAll = (str: string, find: string, replace: string) => {
	return str.replace(new RegExp(find, 'g'), replace)
}

export const getRandomInt = (max: number) => {
	max = Math.floor(max)
	return Math.floor(Math.random() * max)
}
