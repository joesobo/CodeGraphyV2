import * as d3 from 'd3'
import randomColor from 'randomcolor'

import type { D3Color, Extension, Node, ParseOptions } from './types'

import { getRandomIntSeed } from './basic'
import { d3ColorSchemes } from './d3ColorSchemes'

export const parseExtensions = (
	nodes: Node[] | undefined,
	options: ParseOptions,
) => {
	const extensions: Extension[] = []
	if (!nodes) return extensions

	nodes.forEach((node) => {
		let extension = ''
		if (node.name.startsWith('.')) {
			extension = `.${node.name.substring(1).split('.').slice(1).join('.')}`
		} else {
			extension = `.${node.name.split('.').slice(1).join('.')}`
		}

		if (extension === '.') {
			extension = options.mode === 'Directory' ? 'Directory' : 'Package'
		}

		const extensionIndex = extensions.findIndex(
			(ext) => ext.extension === extension,
		)
		if (extensionIndex === -1) {
			extensions.push({
				extension,
				color: '',
				count: 1,
				lines: node.lines ?? 0,
			})
		} else {
			extensions[extensionIndex].count++
			extensions[extensionIndex].lines += node.lines ?? 0
		}
	})

	// color per extension
	extensions.forEach((extension) => {
		let color
		// Random Color
		if (options.useRandomColor) {
			color = randomColor({
				luminosity: 'light',
				seed: extension.extension,
			})
		} else {
			// D3 Color
			const selectedThemeInterpolator: ((t: number) => string) | undefined =
        d3ColorSchemes.find(
        	(theme: D3Color) => theme.name === options.d3Color,
        )?.interpolator
			const d3Color = d3
				.scaleSequential()
				.domain([0, extensions.length])
				.interpolator(selectedThemeInterpolator ?? d3.interpolateRainbow)
			if (d3Color) {
				color = d3Color(
					getRandomIntSeed(extension.extension, extensions.length),
				)
			} else {
				// Default Color
				color = '#000000'
			}
		}

		extension.color = color
	})

	// Override Extension Colors
	options.overrideExtensionColors.forEach((override) => {
		const extensionIndex = extensions.findIndex(
			(ext) => ext.extension === override.name,
		)
		if (extensionIndex !== -1) {
			extensions[extensionIndex].color = override.color
		}
	})

	extensions.sort((a, b) => {
		return a.extension.length - b.extension.length
	})

	return extensions
}
