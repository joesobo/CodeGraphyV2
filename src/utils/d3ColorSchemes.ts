import * as d3 from 'd3'

import { D3Color } from './types'

export const d3ColorSchemes: D3Color[] = [
	{
		name: 'Inferno',
		interpolator: d3.interpolateInferno,
	},
	{
		name: 'Magma',
		interpolator: d3.interpolateMagma,
	},
	{
		name: 'Turbo',
		interpolator: d3.interpolateTurbo,
	},
	{
		name: 'Cool',
		interpolator: d3.interpolateCool,
	},
	{
		name: 'Warm',
		interpolator: d3.interpolateWarm,
	},
	{
		name: 'CubehelixDefault',
		interpolator: d3.interpolateCubehelixDefault,
	},
	{
		name: 'Rainbow',
		interpolator: d3.interpolateRainbow,
	},
	{
		name: 'Sinebow',
		interpolator: d3.interpolateSinebow,
	},
	{
		name: 'Spectral',
		interpolator: d3.interpolateSpectral,
	},
]

export const colorSchemes = [
	'Inferno',
	'Magma',
	'Turbo',
	'Cool',
	'Warm',
	'CubehelixDefault',
	'Rainbow',
	'Sinebow',
	'Spectral',
]

export const getD3BackgroundColor = (color: string) => {
	const selectedThemeInterpolator: ((t: number) => string) | undefined =
    d3ColorSchemes.find((theme: D3Color) => theme.name === color)?.interpolator
	const d3Color = d3
		.scaleSequential()
		.domain([1, 10])
		.interpolator(selectedThemeInterpolator ?? d3.interpolateRainbow)

	const colors = Array.from({ length: 11 }, (_, i) => d3Color(i))
	const gradient = `background-image: linear-gradient(to bottom right, ${colors.join(
		', ',
	)}); text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);`
	return gradient
}
