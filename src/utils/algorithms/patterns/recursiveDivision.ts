import { RecursiveDivisionOrientations } from "@/enums/RecursiveDivisionOrientation.enum";
import { RECURSIVE_DIVISION_MIN_RESOLUTION } from "@/lib/constants";
import { Position } from "@/lib/types";
import { getRandomNumber } from "@/lib/utils";

export default function recursiveDivision(row: number, col: number, width: number, height: number): Position[] {
  const divisionResult: Position[] = [];

  if (width < RECURSIVE_DIVISION_MIN_RESOLUTION || height < RECURSIVE_DIVISION_MIN_RESOLUTION) {
    return divisionResult;
  }

  const orientation = getDivisionOrientation(width, height);

  let wallRow: number;
  let wallCol: number;
  let doorRow: number;
  let doorCol: number;

  if (orientation === RecursiveDivisionOrientations.HORIZONTAL) {
    wallRow = getRandomEven(row + 1, row + height - 2);
    doorCol = getRandomOdd(col, col + width - 1);

    for (let c = col; c < col + width; c++) {
      if (c !== doorCol) {
        divisionResult.push({ row: wallRow, col: c });
      }
    }

    const topRegion = recursiveDivision(row, col, width, wallRow - row);
    const bottomRegion = recursiveDivision(wallRow + 1, col, width, row + height - wallRow - 1);

    divisionResult.push(...topRegion, ...bottomRegion);
  } else {
    wallCol = getRandomEven(col + 1, col + width - 2);
    doorRow = getRandomOdd(row, row + height - 1);

    for (let r = row; r < row + height; r++) {
      if (r !== doorRow) {
        divisionResult.push({ row: r, col: wallCol });
      }
    }

    const leftRegion = recursiveDivision(row, col, wallCol - col, height);
    const rightRegion = recursiveDivision(row, wallCol + 1, col + width - wallCol - 1, height);

    divisionResult.push(...leftRegion, ...rightRegion);
  }

  return divisionResult;
}

function getDivisionOrientation(width: number, height: number): RecursiveDivisionOrientations {
  if (width < height) return RecursiveDivisionOrientations.HORIZONTAL;
  if (width > height) return RecursiveDivisionOrientations.VERTICAL;

  const randomIndex = getRandomNumber(0, 1);
  return (Object.values(RecursiveDivisionOrientations) as RecursiveDivisionOrientations[])[randomIndex];
}

// TODO: Refactor

function getRandomEven(min: number, max: number): number {
  const evenMin = min + (min % 2 === 0 ? 0 : 1);
  const evenMax = max - (max % 2 === 0 ? 0 : 1);
  const count = Math.floor((evenMax - evenMin) / 2) + 1;
  const index = getRandomNumber(0, count - 1);

  return evenMin + index * 2;
}

function getRandomOdd(min: number, max: number): number {
  const oddMin = min + (min % 2 === 1 ? 0 : 1);
  const oddMax = max - (max % 2 === 1 ? 0 : 1);
  const count = Math.floor((oddMax - oddMin) / 2) + 1;
  const index = getRandomNumber(0, count - 1);

  return oddMin + index * 2;
}