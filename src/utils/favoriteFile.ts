import * as vscode from 'vscode'

import type { Node } from './types'

export const favoriteFile = async (node: Node) => {
	const configuration = vscode.workspace.getConfiguration().codegraphy
	const favorites: string[] = configuration.favorites

	const isFavorite = favorites.includes(node.fullPath)

	if (isFavorite) {
		const index = favorites.indexOf(node.fullPath)
		favorites.splice(index, 1)
	} else {
		favorites.push(node.fullPath)
	}

	configuration.update(
		'favorites',
		favorites,
		vscode.ConfigurationTarget.Workspace,
	)
}

export const isFavorite = (filePath: string) => {
	const configuration = vscode.workspace.getConfiguration().codegraphy
	const favorites: string[] = configuration.favorites

	return favorites.includes(filePath)
}
