import * as d3 from 'd3'
import randomColor from 'randomcolor'

import { getRandomIntSeed } from './basic'
import { d3ColorSchemes } from './d3ColorSchemes'
import type { D3Color, Extension, Node, ParseOptions } from './types'

export const parseExtensions = (nodes: Node[] | undefined, options: ParseOptions) => {
	const extensions: Extension[] = []
	if (!nodes) return extensions

	nodes.forEach((node) => {
		let extension = ''
		if (node.name.startsWith('.')) {
			extension = node.name.substring(1).split('.').slice(1).join('.')
		} else {
			extension = node.name.split('.').slice(1).join('.')
		}

		const extensionIndex = extensions.findIndex((ext) => ext.extension === extension)
		if (extensionIndex === -1) {

			let color
			// Random Color
			if (options.useRandomColor) {
				color = randomColor({
					luminosity: 'light',
					seed: extension,
				})
			} else {
				// D3 Color
				const selectedThemeInterpolator: ((t: number) => string) | undefined = d3ColorSchemes.find((theme: D3Color) => theme.name === options.d3Color)?.interpolator
				const d3Color = d3.scaleSequential()
					.domain([1,10])
					.interpolator(selectedThemeInterpolator ?? d3.interpolateRainbow)
				if (d3Color) {
					color = d3Color(getRandomIntSeed(extension, 10))
				} else {
					// Default Color
					color = '#000000'
				}
			}

			extensions.push({
				language: 'Test',
				extension,
				color,
				count: 1,
				lines: node.lines ?? 0,
			})
		} else {
			extensions[extensionIndex].count ++
			extensions[extensionIndex].lines += node.lines ?? 0
		}
	})

	extensions.sort((a, b) => {
		return a.extension.length - b.extension.length
	})

	return extensions
}
