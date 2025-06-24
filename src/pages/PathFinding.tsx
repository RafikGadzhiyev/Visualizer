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
  PathFindingAlgorithmResult,
  Position
} from "@/lib/types"

import { CELL_STATE } from '../enums/cellState.enum'


import './../styles/path-finding.css'
import bfs from "@/utils/algorithms/pathFinding/BFS"


function PathFinding() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bfs')
  const [illustrationSpeed, setIllustrationSpeed] = useState(DEFAULT_ILLUSTRATION_SPEED)

  const [grid, setGrid] = useState<Array<GridItem[]>>([])

  const [isVisualizing, setIsVisualizing] = useState(false)
  const [isRanAtLeastOne, setIsRanAtLeastOne] = useState(false)

  const gridRef = useRef<HTMLDivElement | null>(null)

  const startPosition = useRef<Position>({ row: 1, col: 1})
  const endPosition = useRef<Position>({row: 3, col: 3})

  const wallPositions = useRef<Set<string>>(new Set())

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

    if (row === startPosition.current.row && col === startPosition.current.col) {
      functionType = 'change-start-position'
    }
    else if (row === endPosition.current.row && col === endPosition.current.col) {
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

    if (
      functionType === 'block-cell'
      && (
        row !== startPosition.current.row || col !== startPosition.current.col
        || row !== endPosition.current.row || col !== endPosition.current.col
      )
    ) {
      addNewWall(
        {
          row,
          col
        }
      )
    }
    else if (functionType === 'change-start-position') {
      updateStartPosition(
        startPosition.current,
        {
          row,
          col
        }
      )
    }
    else if (functionType === 'change-finish-position') {
      updateEndPosition(
        endPosition.current,
        {
          row,
          col
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

  function addNewWall(wallPosition: Position) {
    const cellToBeWallKey = getKeyFromCellPosition(wallPosition)

    const cellToBeWall = document.querySelector(`[data-itemKey="${cellToBeWallKey}"]`)

    cellToBeWall?.classList
      .add(
        'path--wall'
      )

    wallPositions.current
      .add(cellToBeWallKey)

    if (isRanAtLeastOne) {
      runAlgorithm(0)
    }
  }

  // REFACTOR: Merge into ione function
  function updateStartPosition(oldStartPosition: Position, newStartPosition: Position) {
    const oldStartPositionCellKey = getKeyFromCellPosition(oldStartPosition)
    const newStartPositionCellKey = getKeyFromCellPosition(newStartPosition)

    const oldStartPositionCell = document.querySelector(`[data-itemKey="${oldStartPositionCellKey}"]`)
    const newStartPositionCell = document.querySelector(`[data-itemKey="${newStartPositionCellKey}"]`)

    oldStartPositionCell?.classList.remove('path--start-position')
    newStartPositionCell?.classList.add('path--start-position')

    startPosition.current = newStartPosition

    if (isRanAtLeastOne) {
      runAlgorithm(0)
    }
  }

    function updateEndPosition(oldEndPosition: Position, newEndPosition: Position) {
    const oldEndPositionCellKey = getKeyFromCellPosition(oldEndPosition)
    const newEndPositionCellKey = getKeyFromCellPosition(newEndPosition)

    const oldEndPositionCell = document.querySelector(`[data-itemKey="${oldEndPositionCellKey}"]`)
    const newStartPositionCell = document.querySelector(`[data-itemKey="${newEndPositionCellKey}"]`)

    oldEndPositionCell?.classList.remove('path--finish-position')
    newStartPositionCell?.classList.add('path--finish-position')

    endPosition.current = newEndPosition

    if (isRanAtLeastOne) {
      runAlgorithm(0)
    }
  }

  function onClickHandler() {
    setIsVisualizing(true)
    setIsRanAtLeastOne(true)

    const algorithmResult = runAlgorithm(illustrationSpeed)

    let setIsVisualizingTimeout = 0;

    if (algorithmResult) {
      const shortestPathLength = algorithmResult?.shortestPath[0]?.pathLength
        || 0

      setIsVisualizingTimeout = illustrationSpeed * shortestPathLength + illustrationSpeed * algorithmResult.shortestPath.length
    }

    setTimeout(
      () => {
        setIsVisualizing(false)
      },
      setIsVisualizingTimeout
    )
  }

  function runAlgorithm(runSpeed: number): PathFindingAlgorithmResult | null {
    resetGrid()

    let algorithmResult: PathFindingAlgorithmResult | null = null;

    switch(selectedAlgorithm) {
      case "bfs":
        algorithmResult = bfs(
          grid,
          startPosition.current,
          endPosition.current,
          wallPositions.current,
        )
        break;
    }

    if (algorithmResult) {
      visualizePath(algorithmResult, runSpeed)
    }

    return algorithmResult
  }

  function visualizePath(algorithmResult: PathFindingAlgorithmResult, visualizationSpeed: number) {
    const shortestPathLength = algorithmResult.shortestPath[0]?.pathLength
      || 0

    for (let i = 0; i < algorithmResult.traversedPath.length; i++) {
      const traversedCell = algorithmResult.traversedPath[i]
      const cellNode = document.querySelector(`[data-itemKey="${traversedCell.key}"]`)

      const isCellVisualized = cellNode?.classList
        .contains('path--current-visit')

      if (!isCellVisualized) {
        if (!visualizationSpeed) {
          cellNode?.classList.add('path--current-visit')
        }
        else {
          setTimeout(
            () => {
              cellNode?.classList.add('path--current-visit')

            },
            visualizationSpeed * (traversedCell.pathLength as number),
          )
        }

        if (
          traversedCell.pathLength !== shortestPathLength
          || (traversedCell.row === endPosition.current.row && traversedCell.col === endPosition.current.col)
        ) {
          if (!visualizationSpeed) {
            cellNode?.classList.add('path--visited-cell')
          }
          else {
            setTimeout(
              () => {
                cellNode?.classList.remove('path--current-visit')
                cellNode?.classList.add('path--visited-cell')

              },
              visualizationSpeed * (traversedCell.pathLength as number + 1),
            )
          }
        }
      }
    }

    for (let i = 0; i < algorithmResult.shortestPath.length; i++){
      const traversedCell = algorithmResult.shortestPath[i]
      const cellNode = document.querySelector(`[data-itemKey="${traversedCell.key}"]`)

      if (!visualizationSpeed) {
        cellNode?.classList.add(
          'path--found-path-cell',
        )
      }
      else {
        setTimeout(
          () => {
            cellNode?.classList.add(
              'path--found-path-cell',
              'animate-ping-short'
            )
          },
          visualizationSpeed * i + visualizationSpeed * (shortestPathLength as number),
        )
      }
    }
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

  useEffect(
    () => {
      if (grid.length) {
        // FIXME I Guess it is bad - need to fix
        updateStartPosition(
          startPosition.current,
          {
            row: 1,
            col: 1,
          }
        )

        updateEndPosition(
          endPosition.current,
          {
            row: 3,
            col: 3,
          }
        )
      }
    },
    [ grid ]
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
            onClick={onClickHandler}
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
                            className="path--cell transition ease-in-out select-none border h-full min-h-2 flex-1"
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
