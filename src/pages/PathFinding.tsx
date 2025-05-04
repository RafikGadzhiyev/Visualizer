import {
  useEffect,
  useRef,
  useState
} from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"


import {
  GRID_COLS,
  GRID_ROWS
} from "@/lib/constants"
import { GridItem, Position } from "@/lib/types"
import clsx from "clsx"

import './../styles/path-finding.css'
import { sleep } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function PathFinding() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bfs')

  const [grid, setGrid] = useState<Array<GridItem[]>>([])

  const [startPosition, setStartPosition] = useState<Position>({ row: 1, col: 1 })
  const [finishPosition, setFinishPosition] = useState<Position>({ row: 10, col: 2})

  const [visitingCells, setVisitingCells] = useState<string[]>([])

  const gridRef = useRef<HTMLDivElement | null>(null)

  function initGrid() {
    const preparedGrid = [];

    for (let i = 0; i < GRID_ROWS; ++i) {
      const row = []

      for (let j = 0; j < GRID_COLS; ++j) {
        row.push(
          {
            key: i + '__' + j,
            row: i,
            col: j,
            blocked: false,
            visited: false,
            pathPart: false,
          }
        )
      }

      preparedGrid.push(row)
    }

    setGrid(preparedGrid)
  }

  function onGridMouseDown() {
    if (!gridRef.current) {
      return
    }

    console.log('down')

    gridRef.current.addEventListener(
      'mousemove',
      onGridMouseMove
    )

    gridRef.current.addEventListener(
      'mouseup',
      onGridMouseUp
    )
  }

  function onGridMouseMove(e: MouseEvent) {
    if (!gridRef.current) {
      return;
    }

    const gridCell = e.target as HTMLDivElement

    if (!gridCell.hasAttribute('data-itemKey')) {
      return
    }

    const cellKey = gridCell.getAttribute('data-itemKey') as string

    const [
      row,
      col
    ] = cellKey
      .split('__')
      .map(key => +key)

      if (grid[row][col].blocked) {
        return;
      }

      setGrid(
        prevGrid => {
          prevGrid[row][col].blocked = true

          // TODO: clone util
          return JSON.parse(JSON.stringify(prevGrid))
        }
      )
  }

  function onGridMouseUp() {
    if (!gridRef.current) {
      return
    }

    gridRef.current.removeEventListener(
      'mousemove',
      onGridMouseMove,
    )

    gridRef.current.removeEventListener(
      'mouseup',
      onGridMouseUp
    )
  }

  async function bfs() {
    setGrid(
      prevGrid => {
        for (const row of prevGrid) {
          for (const cell of row) {
            cell.visited = false;
            cell.pathPart = false
          }
        }

        return [...prevGrid]
      }
    )

    const startGridItem = grid[startPosition.row][startPosition.col]

    const queue: {cell: any, parent: any}[]= [
      {
        cell: startGridItem,
        parent: null,
      }
    ]

    const dirs = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0]
    ]

    while (queue.length) {
      let length = queue.length

      // console.log(queue, grid)
      while (length--) {
        const node = queue.shift()

        if (!node) {
          continue
        }

        const cell = node.cell

        if (
          cell.blocked
          || cell.visited
        ) {
          continue
        }

        grid[cell.row][cell.col].visited = true
        grid[cell.row][cell.col].parent = node.parent

        if (cell.row === finishPosition.row && cell.col === finishPosition.col) {
          setVisitingCells([])
          showShortestPath()
          return ;
        }

        for (const [dRow, dCol] of dirs) {
          const nextRow = cell.row + dRow;
          const nextCol = cell.col + dCol;

          if (
            nextRow < 0
            || nextCol < 0
            || nextRow >= grid.length
            || nextCol >= grid[0].length
          ) {
            continue
          }

          queue.push(
            {
              cell: grid[nextRow][nextCol],
              parent: {
                row: cell.row,
                col: cell.col
              },
            }
          )
        }
      }

      setGrid(() => [...grid])
      setVisitingCells(() => [...queue.map(node => node.cell.key)])

      await sleep(100)
    }

    setVisitingCells([])
  }

  async function showShortestPath() {
    let currentCell = grid[finishPosition.row][finishPosition.col]

    while (currentCell.parent) {
      if (currentCell.col === startPosition.col && currentCell.row === startPosition.row) {
        break;
      }

      currentCell.pathPart = true

      currentCell = grid[currentCell.parent.row][currentCell.parent.col]
      setGrid([...grid])
      await sleep(100)
    }

  }

  useEffect(
    () => {
      initGrid()
    },
    []
  )

  // TODO: User can D&D start and finish positions
  return(
    <div className="p-3 min-h-screen h-screen">
      <Card className="h-full">
        <CardHeader className="flex flex-wrap items-center">
          <Select
            value={selectedAlgorithm}
            onValueChange={setSelectedAlgorithm}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Algorithm" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="bfs">BFS</SelectItem>
              <SelectItem value="dfs" disabled>DFS</SelectItem>
              <SelectItem value="dijkstra" disabled>dijkstra</SelectItem>
              <SelectItem value="a_star" disabled>A*</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => bfs()}
            variant='positive'
          >
            Run
          </Button>
        </CardHeader>
        <CardContent className="h-full overflow-x-auto">
          <div
            ref={gridRef}
            onMouseDown={onGridMouseDown}
            className="h-full flex flex-col justify-start"
          >
            {
              !!grid.length && grid.map(
                (gridRow, gridRowIndex) => (
                  <div
                    key={gridRowIndex}
                    className="flex flex-1 items-start"
                  >
                    {
                      gridRow.map(
                        gridItem => (
                          <div
                            key={gridItem.key}
                            data-itemkey={gridItem.key}
                            className={
                              clsx(
                                {
                                  'transition ease-in-out select-none border h-full min-h-2 flex-1': true,
                                  'path--cell': !gridItem.blocked && !gridItem.visited,
                                  'path--wall': gridItem.blocked,
                                  'path--start-position': startPosition.row === gridItem.row && startPosition.col === gridItem.col,
                                  'path--finish-position': finishPosition.row === gridItem.row && finishPosition.col === gridItem.col,
                                  'path--visited-cell': gridItem.visited,
                                  'path--current-visit': visitingCells.includes(gridItem.key),
                                  'path--found-path-cell': gridItem.pathPart,
                                  'animate-ping-short': gridItem.pathPart
                                }
                              )
                            }
                          >

                          </div>
                        )
                      )
                    }
                  </div>
                )
              )
            }
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PathFinding
