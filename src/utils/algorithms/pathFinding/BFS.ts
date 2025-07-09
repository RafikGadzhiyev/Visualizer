import { getKeyForPosition } from "@/lib/pathFinding.helpers";
import {
  GridItem,
  PathFindingAlgorithmResult,
  Position,
 } from "@/lib/types";

function bfs(grid: Array<GridItem[]>, startPosition: Position, endPosition: Position, wallPositions: Set<string>): PathFindingAlgorithmResult {
  const traversedPath: Array<GridItem> = []
  const shortestPath: Array<GridItem> = [];

  const queue: GridItem[] = [
    grid[startPosition.row][startPosition.col]
  ]

  grid[startPosition.row][startPosition.col].parent = null

  const dirs = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ]

  let pathLength = 0;

  let isPathFound = false
  let pathCell: GridItem | null = null;

  const visitedCells = new Set()

  while (queue.length) {
    let length = queue.length;

    while (length--) {
      const cell = queue.shift()

      if (!cell) {
        continue
      }

      const cellKey = getKeyForPosition(cell)

      const isCellVisitied = visitedCells
        .has(cellKey)

      const isCellWall = wallPositions
        .has(cellKey)

      if (
        isCellWall
        || isCellVisitied
      ) {
        continue
      }

      cell.pathLength = pathLength

      traversedPath
        .push(cell)

      if (cell.row === endPosition.row && cell.col === endPosition.col) {
        pathCell = cell;
        isPathFound = true;
      }

      for (const [dRow, dCol] of dirs) {
        const nextRow = cell.row + dRow;
        const nextCol = cell.col + dCol;

        const nextCellKey = getKeyForPosition(
          {
            row: nextRow,
            col: nextCol
          }
        )

        const isCellVisitied = visitedCells
          .has(nextCellKey)

        if (
          nextRow < 0
          || nextCol < 0
          || nextRow >= grid.length
          || nextCol >= grid[0].length
          || isCellVisitied
        ) {
          continue
        }

        grid[nextRow][nextCol].parent = cell

        queue.push(grid[nextRow][nextCol])
      }

      visitedCells
        .add(cellKey)
    }

    if (isPathFound) {
      break;
    }

    pathLength += 1;
  }

  if (pathCell) {
    while (pathCell.row !== startPosition.row || pathCell.col !== startPosition.col) {
      shortestPath
        .push(
          pathCell
        )

      pathCell = pathCell.parent as GridItem
    }
  }

  return {
    traversedPath,
    shortestPath,
  }
}

export default bfs