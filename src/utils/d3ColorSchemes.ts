import * as d3 from 'd3'

import { D3Color } from './types'

export const d3ColorSchemes: D3Color[] = [
	{
		name: 'Inferno',
		interpolator: d3.interpolateInferno
	},
	{
		name: 'Magma',
		interpolator: d3.interpolateMagma
	},
	{
		name: 'Turbo',
		interpolator: d3.interpolateTurbo
	},
	{
		name: 'Cool',
		interpolator: d3.interpolateCool
	},
	{
		name: 'Warm',
		interpolator: d3.interpolateWarm
	},
	{
		name: 'CubehelixDefault',
		interpolator: d3.interpolateCubehelixDefault
	},
	{
		name: 'Rainbow',
		interpolator: d3.interpolateRainbow
	},
	{
		name: 'Sinebow',
		interpolator: d3.interpolateSinebow
	}
]
