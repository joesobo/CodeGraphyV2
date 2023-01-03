import type { SimulationNodeDatum } from 'd3'

export interface Node extends SimulationNodeDatum {
	id: number;
	name: string;
	fullPath: string;
	radius: number;
	category: number;
}

export type Connection = {
	id: string
	source: number
	target: number
}

export interface CustomSubject {
	nodeId: string;
	name: string;
	fx: number | null;
	fy: number | null;
	x: number;
	y: number;
	r: number;
}
