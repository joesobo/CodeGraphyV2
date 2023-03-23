export const containsBlacklist = (path: string, blacklist: string[] = []) => {
	return blacklist.some((blacklistItem) => {
		return path.includes(blacklistItem)
	})
}
