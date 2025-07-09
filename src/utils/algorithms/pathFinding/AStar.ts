import { getKeyForPosition } from "@/lib/pathFinding.helpers";
import { AStarNode, GridItem, Position } from "@/lib/types";

function aStar(grid: Array<GridItem[]>, startPosition: Position, endPosition: Position, wallPositions: Set<string>) {
  const shortestPath: GridItem[] = []

  const openedList: AStarNode[] = [];
  const closedList: AStarNode[] = [];

  const startNode: AStarNode = structuredClone(startPosition) as AStarNode

  // f = total distance of the path throught the cell
  // h = distance from cell to goal (end) cell
  // pathLength - distance from start to current cell
  startNode.pathLength = 0;
  startNode.f = 0
  startNode.h = 0;

  openedList.push(startNode)

  const dirs = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
  ]

  let pathCell: AStarNode | null = null;

  while (openedList.length) {
    const lowestNodeIndex = getLowestNodeIndex(openedList)
    const lowestNode = openedList[lowestNodeIndex]

    openedList.splice(lowestNodeIndex, 1)

    for (const [dRow, dCol] of dirs) {
      const nextRow = lowestNode.row + dRow
      const nextCol = lowestNode.col + dCol

      const cellKey = getKeyForPosition(
        {
          row: nextRow,
          col: nextCol
        }
      )

      if (
        nextCol < 0
        || nextRow < 0
        || nextRow >= grid.length
        || nextCol >= grid[0].length
        || wallPositions.has(cellKey)
      ) {
        continue
      }

      const successor: AStarNode = structuredClone(grid[nextRow][nextCol]) as AStarNode

      successor.parent = lowestNode
      successor.pathLength = (lowestNode.pathLength as number) + 1
      successor.h = manhattanDistance(endPosition, successor)
      successor.f = successor.pathLength + successor.h

      if (nextRow === endPosition.row && nextCol === endPosition.col) {
        pathCell = successor

        break;
      }

      const needToSkipSuccessor = openedList
        .some(
          node => node.row === successor.row
            && node.col === successor.col
            && node.f <= successor.f
        ) || closedList
        .some(
          node => node.row === successor.row
            && node.col === successor.col
            && node.f <=  successor.f
        )

      if (needToSkipSuccessor) {
        continue
      }


      if (pathCell) {
        break;
      }

      openedList
        .push(
          successor
      )
    }

    closedList
      .push(lowestNode)
  }

  while (pathCell) {
    shortestPath
      .push(
        pathCell
      )

    pathCell = pathCell.parent as AStarNode
  }

  return {
    traversedPath: closedList,
    shortestPath
  }
}

function getLowestNodeIndex(list: AStarNode[]) {
  let result: number = -1;

  for (const itemIndex in list) {
    const item = list[itemIndex]

    if (
      result === -1
      || item.f <= list[result].f
    ) {
      result = +itemIndex;
    }
  }

  return result
}

// Suitable for our case dut to 4-directional logic
function manhattanDistance(nodeA:Position, nodeB:Position) {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col)
}

export default aStar