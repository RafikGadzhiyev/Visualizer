import {
  useEffect,
  useRef,
  useState
} from "react"
import clsx from "clsx"

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

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

import { sleep } from "@/lib/utils"

import {
  GRID_COLS,
  GRID_ROWS,

  DEFAULT_ILLUSTRATION_SPEED,
  MAX_ILLUSTRATION_SPEED,
  MIN_ILLUSTRATION_SPEED
} from "@/lib/constants"

import {
  GridItem,
  PathNode,
  Position
} from "@/lib/types"

import { CELL_STATE } from '../enums/cellState.enum'


import './../styles/path-finding.css'


function PathFinding() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bfs')
  const [illustrationSpeed, setIllustrationSpeed] = useState(DEFAULT_ILLUSTRATION_SPEED)

  const [grid, setGrid] = useState<Array<GridItem[]>>([])

  const [startPosition, setStartPosition] = useState<Position>({ row: 1, col: 1 })
  const [finishPosition, setFinishPosition] = useState<Position>({ row: 10, col: 10})

  const [visitingCells, setVisitingCells] = useState<string[]>([])

  const [isVisualizing, setIsVisualizing] = useState(false)

  const gridRef = useRef<HTMLDivElement | null>(null)

  function initGrid() {
    const preparedGrid: Array<GridItem[]> = [];

    for (let i = 0; i < GRID_ROWS; ++i) {
      const row = []

      for (let j = 0; j < GRID_COLS; ++j) {
        const cellPosition = {
          row: i,
          col: j,
        }

        row.push(
          {
            key: getKeyFromCellPosition(cellPosition),
            row: i,
            col: j,
            state: CELL_STATE.EMPTY,
            parent: null,
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
    ] = getCellPositionFromKey(cellKey)

      if (grid[row][col].state === CELL_STATE.BLOCKED) {
        return;
      }

      if (row === startPosition.row && col === startPosition.col) {
        return;
      }

      if (row === finishPosition.row && col === finishPosition.col) {
        return;
      }

      setGrid(
        prevGrid => {
          prevGrid[row][col].state = CELL_STATE.BLOCKED;

          return [...prevGrid]
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

  function runAlgorithm() {
    setIsVisualizing(true)

    switch(selectedAlgorithm) {
      case "bfs":
        return bfs()
    }
  }

  async function bfs() {
    setGrid(
      prevGrid => {
        for (const row of prevGrid) {
          for (const cell of row) {
            if (cell.state === CELL_STATE.BLOCKED) {
              continue
            }

            cell.state = CELL_STATE.EMPTY
          }
        }

        return [...prevGrid]
      }
    )

    const startGridItem = grid[startPosition.row][startPosition.col]

    const queue: PathNode[]= [
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
          cell.state === 'blocked'
          || cell.state === 'visited'
        ) {
          continue
        }

        grid[cell.row][cell.col].state = CELL_STATE.VISITED
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

      await sleep(illustrationSpeed)
    }

    setVisitingCells([])
  }

  async function showShortestPath() {
    let currentCell = grid[finishPosition.row][finishPosition.col]

    while (currentCell.parent) {
      if (currentCell.col === startPosition.col && currentCell.row === startPosition.row) {
        break;
      }

      currentCell.state = CELL_STATE.PATH_PART

      currentCell = grid[currentCell.parent.row][currentCell.parent.col]
      setGrid([...grid])
      await sleep(illustrationSpeed)
    }

    setIsVisualizing(false)
  }

  function getCellPositionFromKey(key: string) {
    return key
    .split('__')
    .map(
      stringifiedKeyPart => +stringifiedKeyPart
    )
  }

  function getKeyFromCellPosition(cellPosition: Position) {
    return cellPosition.row + '__' + cellPosition.col
  }

  function onIllustrationSpeedChange(newIllustrationSpeed: number) {
    setIllustrationSpeed(newIllustrationSpeed)
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
              <SelectItem value="dijkstra" disabled>dijkstra</SelectItem>
              <SelectItem value="a_star" disabled>A*</SelectItem>
            </SelectContent>
          </Select>

          <div className='flex flex-col gap-1'>
            <label className='text-sm'>
              Illustration speed
            </label>

            <Slider
              onValueChange={(e) => onIllustrationSpeedChange(e[0])}
              defaultValue={[DEFAULT_ILLUSTRATION_SPEED]}
              min={MIN_ILLUSTRATION_SPEED}
              max={MAX_ILLUSTRATION_SPEED}
              step={1}
              className='flex-1'
            />
          </div>

          <Button
            onClick={runAlgorithm}
            disabled={isVisualizing}
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
                                  'path--cell': gridItem.state !== CELL_STATE.BLOCKED && gridItem.state !== CELL_STATE.VISITED,
                                  'path--wall': gridItem.state === CELL_STATE.BLOCKED,
                                  'path--start-position': startPosition.row === gridItem.row && startPosition.col === gridItem.col,
                                  'path--finish-position': finishPosition.row === gridItem.row && finishPosition.col === gridItem.col,
                                  'path--visited-cell': gridItem.state === CELL_STATE.VISITED,
                                  'path--current-visit': visitingCells.includes(gridItem.key),
                                  'path--found-path-cell animate-ping-short': gridItem.state === CELL_STATE.PATH_PART,
                                }
                              )
                            }
                          />
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
