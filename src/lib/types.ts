import { CELL_STATE } from '../enums/cellState.enum'

export type GridItem = {
  key: string,
  row: number,
  col: number,
  state: CELL_STATE,
  parent: GridItem | null,
  pathLength: number | null,
}

export type Position = {
  row: number,
  col: number
}

export type Node = {
  key: string,
  parent?: string,
}

export type PathNode = {
  cell: GridItem,
  parent: Position | null,
}

export type PathFindingAlgorithmResult = {
  traversedPath: GridItem[],
  shortestPath: GridItem[],
}