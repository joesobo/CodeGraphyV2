import type { SimulationNodeDatum } from 'd3'

export interface Node extends SimulationNodeDatum {
  id: number
  name: string
  fullPath: string
  radius: number
  depth: number
  collapsed: boolean
  hidden: boolean
  type: 'File' | 'Directory' | 'Package'
  lines?: number
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
  extension: string
  color: string
  count: number
  lines: number
}

export interface ParseOptions {
  mode: 'Interaction' | 'Directory'
  useRandomColor: boolean
  overrideExtensionColors: Record<string, string>[]
  d3Color?: string
}

export interface D3Color {
  name: string
  interpolator: (t: number) => string
}

export interface File {
  name: string
  lines: number
}

export interface Directory {
  name: string
}

export interface Package {
  name: string
}

export interface UnprocessedNode {
  type: 'File' | 'Directory' | 'Package'
  data: File | Directory | Package
}

export type SVGElement = d3.Selection<
  SVGSVGElement,
  unknown,
  HTMLElement,
  undefined
>

export type NodeSimulation = d3.Simulation<Node, d3.SimulationLinkDatum<Node>>

export type SVGSelection = d3.Selection<
  SVGGElement,
  unknown,
  HTMLElement,
  undefined
>

export type NodeSelection = d3.Selection<
  SVGGElement,
  Node,
  SVGGElement,
  unknown
>

export type SliderInputEvent = {
  target: {
    value: number
  }
}
