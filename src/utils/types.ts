import type { SimulationNodeDatum } from 'd3'

export interface Node extends SimulationNodeDatum {
	id: number
	name: string
	fullPath: string
	radius: number
	lines: number
}

export type Connection = {
	id: string
	source: number
	target: number
}

export interface CustomSubject {
	nodeId: string
	name: string
	fx: number | null
	fy: number | null
	x: number
	y: number
	r: number
}

export interface Extension {
	language: string
	extension: string
	color: string
	count: number
	lines: number
}

export interface ParseOptions {
	useRandomColor: boolean
	d3Color?: string
}

export interface D3Color {
	name: string
	interpolator: (t: number) => string
}

export interface SettingsOptions {
	centerForce: number
	chargeForce: number
	linkForce: number
	linkDistance: number
	useRandomColor: boolean
	d3Color: string
}

export interface File {
	name: string
	lines: number
}
