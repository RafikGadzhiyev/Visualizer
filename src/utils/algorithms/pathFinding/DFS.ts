import { GridItem, Position } from "@/lib/types";

export default function dfs(grid: Array<GridItem[]>, startPosition: Position, endPosition: Position, wallPositions: Set<string>) {
  const traversedPath: GridItem[] = [];
  const shortestPath: GridItem[] = [];

  const visitedCells = new Set();

  grid[startPosition.row][startPosition.col].pathLength = 1

  const queue: GridItem[] = [
    grid[startPosition.row][startPosition.col]
  ]

  const dirs = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ]

  let pathCell: GridItem | null = null;
  // TODO: Actually pathLength in a cell should be renamed to something similar to (iterationRound or iterationsCount)
  let pathLength = 0;

  while (queue.length) {
    const cell = queue.pop()

    if (!cell) {
      continue
    }

    traversedPath
      .push(cell)

      pathLength += 1;

    if (cell.row === endPosition.row && cell.col === endPosition.col) {
      pathCell = cell

      break
    }

    const cellKey = cell.row + '__' + cell.col

    if (wallPositions.has(cellKey)) {
      continue
    }

    for (const [dRow, dCol] of dirs) {
      const nextRow = cell.row + dRow
      const nextCol = cell.col + dCol

      if (
        nextRow < 0
        || nextCol < 0
        || nextRow >= grid.length
        || nextCol >= grid[0].length
        || visitedCells.has(nextRow + '__' + nextCol)
      ) {
        continue
      }

      grid[nextRow][nextCol].parent = cell
      grid[nextRow][nextCol].pathLength = pathLength

      queue.push(grid[nextRow][nextCol])
    }

    visitedCells
      .add(
        cell.row + '__' + cell.col
      )
  }

  while (pathCell) {
    shortestPath
      .push(
        pathCell
      )

    pathCell = pathCell.parent
  }

  return {
    traversedPath,
    shortestPath,
  }
}