export type GridItem = {
  key: string,
  row: number,
  col: number,
  blocked: boolean,
  visited: boolean,
  pathPart: boolean,
  parent?: {
    row: number,
    col: number
  },
}

export type Position = {
  row: number,
  col: number
}

export type Node = {
  key: string,
  parent?: string,
}