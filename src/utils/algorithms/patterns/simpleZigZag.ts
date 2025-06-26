import { Position } from "@/lib/types"

export default function simpleZigZagPattern(gridRowsCount: number, gridColsCount: number): Position[] {
  const convertCellsToWallsKeys = []

  let rowIteration = -1 // -1 = up, 1 = down
  const wallProbability = 0.97 // 97%

  let currentGridRow = gridRowsCount - 1

  for (let i = 0; i < gridColsCount; i++) {
    const currentIterationProbability = Math.random()

    if (currentIterationProbability <= wallProbability) {
      convertCellsToWallsKeys
        .push(
          {
            row: currentGridRow,
            col: i
          }
        )
    }

    currentGridRow += rowIteration

    if (currentGridRow === 0) {
      rowIteration = 1
    }
  }

  return convertCellsToWallsKeys
}