import {
  RANDOM_FILLING_PATTERN_MAX_WALLS_PERCENTAGE,
  RANDOM_FILLING_PATTERN_MIN_WALLS_PERCENTAGE
} from "@/lib/constants";

import {
  getRandomNumber,
  shuffle
} from "@/lib/utils";

import { Position } from "@/lib/types";

export default function randomFilling(gridRowsCount: number, gridColsCount: number): Position[] {
  const walls: Position[] = [];
  const gridCellPositions: Position[] = [];

  const totalCellsCount = gridRowsCount * gridColsCount

  for (let i = 0; i < totalCellsCount; ++i) {
    gridCellPositions
      .push(
        {
          row: Math.floor(i / gridRowsCount),
          col: i % gridColsCount,
        }
      )
  }

  shuffle(gridCellPositions)

  let wallsCount = getRandomNumber(totalCellsCount * RANDOM_FILLING_PATTERN_MIN_WALLS_PERCENTAGE, totalCellsCount * RANDOM_FILLING_PATTERN_MAX_WALLS_PERCENTAGE)
  let cellIndex = 0;

  while (wallsCount) {
    walls
      .push(gridCellPositions[cellIndex])

    cellIndex += 1;
    wallsCount -= 1;
  }

  return walls
}