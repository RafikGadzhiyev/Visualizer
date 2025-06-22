import {
  useEffect,
  useRef,
  useState,
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

import {
  GRID_COLS,
  GRID_ROWS,

  DEFAULT_ILLUSTRATION_SPEED,
  MAX_ILLUSTRATION_SPEED,
  MIN_ILLUSTRATION_SPEED
} from "@/lib/constants"

import {
  GridItem,
  Position
} from "@/lib/types"

import { CELL_STATE } from '../enums/cellState.enum'


import './../styles/path-finding.css'
import bfs from "@/utils/algorithms/pathFinding/BFS"


function PathFinding() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bfs')
  const [illustrationSpeed, setIllustrationSpeed] = useState(DEFAULT_ILLUSTRATION_SPEED)

  const [grid, setGrid] = useState<Array<GridItem[]>>([])

  const [startPosition, setStartPosition] = useState<Position>({ row: 1, col: 1 })
  const [finishPosition, setFinishPosition] = useState<Position>({ row: 10, col: 10})

  const [isVisualizing, setIsVisualizing] = useState(false)

  const gridRef = useRef<HTMLDivElement | null>(null)
  //? Is it Good?
  const onMouseMoveHandlerRef = useRef<(e: MouseEvent) => void>(null)

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
            pathLength: 0,
          }
        )
      }

      preparedGrid.push(row)
    }

    setGrid(preparedGrid)
  }

  function onGridMouseDown(e: MouseEvent) {
    if (!gridRef.current) {
      return
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

    let functionType = 'block-cell'

    if (row === startPosition.row && col === startPosition.col) {
      functionType = 'change-start-position'
    }
    else if (row === finishPosition.row && col === finishPosition.col) {
      functionType = 'change-finish-position'
    }

    onMouseMoveHandlerRef.current = (e: MouseEvent) => onGridMouseMove(e, functionType)

    gridRef.current.addEventListener(
      'mousemove',
      onMouseMoveHandlerRef.current,
    )

    gridRef.current.addEventListener(
      'mouseup',
      onGridMouseUp
    )

    gridRef.current.addEventListener(
      'mouseleave',
      onGridMouseUp,
    )
  }

  function onGridMouseMove(e: MouseEvent, functionType: string) {
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

    if (functionType === 'block-cell') {
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
    else if (functionType === 'change-start-position') {
      setStartPosition(
        {
          row,
          col
        }
      )
    }
    else if (functionType === 'change-finish-position') {
      setFinishPosition(
        {
          row,
          col,
        }
      )
    }
  }

  function onGridMouseUp() {
    if (!gridRef.current) {
      return
    }

    if (onMouseMoveHandlerRef.current) {
      gridRef.current.removeEventListener(
        'mousemove',
        onMouseMoveHandlerRef.current,
      )
    }

    gridRef.current.removeEventListener(
      'mouseup',
      onGridMouseUp
    )
  }

  function resetGrid() {
    for (const row of grid) {
      for (const cell of row) {
        const cellNode = document.querySelector(`[data-itemKey="${cell.key}"]`)

        cellNode?.classList.remove(
          "path--visited-cell",
          "path--found-path-cell",
          "path--current-visit",
          "animate-ping-short"
        )
      }
    }
  }

  function runAlgorithm() {
    setIsVisualizing(true)
    resetGrid()

    let algorithmResult: any;

    switch(selectedAlgorithm) {
      case "bfs":
        algorithmResult = bfs(
          grid,
          startPosition,
          finishPosition,
        )
    }

    const shortestPathLength = algorithmResult.shortestPath[0].pathLength

    for (let i = 0; i < algorithmResult.traversedPath.length; i++) {
      const traversedCell = algorithmResult.traversedPath[i]

      setTimeout(
        () => {
          const cellNode = document.querySelector(`[data-itemKey="${traversedCell.key}"]`)

          cellNode?.classList.add('path--current-visit')

        },
        illustrationSpeed * traversedCell.pathLength,
      )

      if (
        traversedCell.pathLength !== shortestPathLength
        || (traversedCell.row === finishPosition.row && traversedCell.col === finishPosition.col)
      ) {
        setTimeout(
          () => {
            const cellNode = document.querySelector(`[data-itemKey="${traversedCell.key}"]`)

            //? Do we actually need to delete prev class
            cellNode?.classList.remove('path--current-visit')
            cellNode?.classList.add('path--visited-cell')
          },
          illustrationSpeed * (traversedCell.pathLength + 1),
        )
      }
    }

    for (let i = 0; i < algorithmResult.shortestPath.length; i++){
      const traversedCell = algorithmResult.shortestPath[i]

      setTimeout(
        () => {
          const cellNode = document.querySelector(`[data-itemKey="${traversedCell.key}"]`)

          cellNode?.classList.add(
            'path--found-path-cell',
            'animate-ping-short'
          )
        },
        illustrationSpeed * i + illustrationSpeed * shortestPathLength,
      )
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
          {/** FIXME: Event does not want to be any */}
          <div
            ref={gridRef}
            onMouseDown={(e: any) => onGridMouseDown(e)}
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
                                'transition ease-in-out select-none border h-full min-h-2 flex-1',
                                {
                                  'path--cell': gridItem.state !== CELL_STATE.BLOCKED && gridItem.state !== CELL_STATE.VISITED,
                                  'path--wall': gridItem.state === CELL_STATE.BLOCKED,
                                  'path--start-position': startPosition.row === gridItem.row && startPosition.col === gridItem.col,
                                  'path--finish-position': finishPosition.row === gridItem.row && finishPosition.col === gridItem.col,
                                  // 'path--current-visit': visitingCells.includes(gridItem.key),
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
