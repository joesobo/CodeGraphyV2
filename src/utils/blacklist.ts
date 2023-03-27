import * as vscode from 'vscode'

export const containsBlacklist = (path: string) => {
	const codeGraphyConfiguration = vscode.workspace.getConfiguration().codegraphy
	const blacklist: string[] = codeGraphyConfiguration.blacklist

	return blacklist.some((blacklistItem) => {
		return path.includes(blacklistItem)
	})
}
