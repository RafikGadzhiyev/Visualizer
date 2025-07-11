import {
  useEffect,
  useRef,
  useState,
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
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from '@/components/ui/label'
// import { Badge } from '@/components/ui/badge'

import {
  GRID_COLS,
  GRID_ROWS,

  DEFAULT_ILLUSTRATION_SPEED,
  MAX_ILLUSTRATION_SPEED,
  MIN_ILLUSTRATION_SPEED,
  ILLUSTATION_SPEED_RANGE_STEP
} from "@/lib/constants"

import {
  getKeyForPosition,
  getPositionFromKey,
} from "@/lib/pathFinding.helpers"

import {
  GridItem,
  PathFindingAlgorithmResult,
  Position
} from "@/lib/types"

import { CELL_STATE } from '../enums/cellState.enum'

import bfs from "@/utils/algorithms/pathFinding/BFS"
import dfs from "@/utils/algorithms/pathFinding/DFS"
import aStar from "@/utils/algorithms/pathFinding/AStar"

import simpleZigZagPattern from "@/utils/algorithms/patterns/simpleZigZag"
import recursiveDivision from "@/utils/algorithms/patterns/recursiveDivision"
import randomFilling from "@/utils/algorithms/patterns/randomFilling"

import './../styles/path-finding.css'

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
  const onPointerMoveHandlerRef = useRef<(e: MouseEvent) => void>(null)

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
            key: getKeyForPosition(cellPosition),
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

    const {
      row,
      col
    } = getPositionFromKey(cellKey)

    let functionType = 'block-cell'

    if (row === startPosition.current.row && col === startPosition.current.col) {
      functionType = 'change-start-position'
    }
    else if (row === endPosition.current.row && col === endPosition.current.col) {
      functionType = 'change-finish-position'
    }

    onPointerMoveHandlerRef.current = (e: MouseEvent) => onGridMouseMove(e, functionType)

    gridRef.current.addEventListener(
      'pointermove',
      onPointerMoveHandlerRef.current,
    )

    gridRef.current.addEventListener(
      'pointerup',
      onGridMouseUp
    )

    gridRef.current.addEventListener(
      'pointerleave',
      onGridMouseUp,
    )
  }

  function onGridMouseMove(e: MouseEvent, functionType: string) {
    if (!gridRef.current) {
      return;
    }

    if (isVisualizing) {
      return
    }

    const gridCell = e.target as HTMLDivElement

    if (!gridCell.hasAttribute('data-itemKey')) {
      return
    }

    const cellKey = gridCell.getAttribute('data-itemKey') as string

    const {
      row,
      col
    } = getPositionFromKey(cellKey)

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

      if (isRanAtLeastOne) {
        runAlgorithm(0)
      }
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

    if (onPointerMoveHandlerRef.current) {
      gridRef.current.removeEventListener(
        'pointermove',
        onPointerMoveHandlerRef.current,
      )
    }

    gridRef.current.removeEventListener(
      'pointerup',
      onGridMouseUp
    )
  }

  function clearGrid(options = {}) {
    const {
      clearWalls = false
    } = options as any

    const classesToDelete = [
      "path--visited-cell",
      "path--found-path-cell",
      "path--current-visit",
      "animate-ping-short"
    ]

    if (clearWalls) {
      classesToDelete
        .push(
          'path--wall'
        )

        wallPositions.current.clear()
    }

    for (const row of grid) {
      for (const cell of row) {
        const cellNode = document.querySelector(`[data-itemKey="${cell.key}"]`)

        cellNode?.classList.remove(...classesToDelete)
      }
    }
  }

  function addNewWall(wallPosition: Position) {
    const cellToBeWallKey = getKeyForPosition(wallPosition)

    const cellToBeWall = document.querySelector(`[data-itemKey="${cellToBeWallKey}"]`)

    cellToBeWall?.classList
      .add(
        'path--wall'
      )

    wallPositions.current
      .add(cellToBeWallKey)
  }

  // REFACTOR: Merge into ione function
  function updateStartPosition(oldStartPosition: Position, newStartPosition: Position) {
    const oldStartPositionCellKey = getKeyForPosition(oldStartPosition)
    const newStartPositionCellKey = getKeyForPosition(newStartPosition)

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
    const oldEndPositionCellKey = getKeyForPosition(oldEndPosition)
    const newEndPositionCellKey = getKeyForPosition(newEndPosition)

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
    clearGrid()

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

      case "dfs":
        algorithmResult = dfs(
          grid,
          startPosition.current,
          endPosition.current,
          wallPositions.current,
        )
        break;

      case 'a_star':
        algorithmResult = aStar(
          grid,
          startPosition.current,
          endPosition.current,
          wallPositions.current
        )
        break;
    }

    if (algorithmResult) {
      visualizePath(algorithmResult, runSpeed)
    }

    return algorithmResult
  }

  function runPattern(patternToRun: string) {
    clearGrid()
    // new maze = new run
    setIsRanAtLeastOne(false)

    const cellsConvertToWalls: Position[] = [];

    if (patternToRun === 'simple_zig_zag_pattern') {
      const simpleStartWalls = simpleZigZagPattern(GRID_ROWS, GRID_COLS)

      cellsConvertToWalls
        .push(
          ...simpleStartWalls
        )
    }
    else if (patternToRun === 'recursive_division') {
      const recursiveDivisionWalls = recursiveDivision(0, 0, GRID_COLS, GRID_ROWS)

      cellsConvertToWalls
        .push(
          ...recursiveDivisionWalls
        )
    }
    else if (patternToRun === 'random_filling') {
      const randomFillingWalls = randomFilling(GRID_ROWS, GRID_COLS)

      cellsConvertToWalls
        .push(
          ...randomFillingWalls
        )
    }

    // REFACTOR: SPLIT LOGIC AND COMBINE IT WITH VISUALIZEPATH !!!!!
    for (const row of grid) {
      for(const cell of row) {
        const cellNode = document.querySelector(`[data-itemKey="${cell.key}"]`)

        cellNode?.classList
          .remove('path--wall')

          wallPositions.current
            .delete(cell.key)
      }
    }

    for (let i = 0; i < cellsConvertToWalls.length; ++i) {
      const cellPosition = cellsConvertToWalls[i]

      setTimeout(
        () => {
          addNewWall(cellPosition)
        },
        illustrationSpeed * i,
      )
    }
  }

  function visualizePath(algorithmResult: PathFindingAlgorithmResult, visualizationSpeed: number) {
    const shortestPathLength = algorithmResult.shortestPath[0]?.pathLength
      || 0

    const longestPathLength = Math.max(
      ...algorithmResult.traversedPath
      .map(gi => gi.pathLength as number)
    )

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
          visualizationSpeed * i + visualizationSpeed * (longestPathLength as number + 1),
        )
      }
    }
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

  return(
    <div className="p-3 min-h-screen h-screen">
      <Card className="h-full min-h-[600px] overflow-y-auto">
        <CardHeader className="flex flex-wrap items-end">
          <div className="flex flex-col gap-2">
            <Label>
              Algorithm
            </Label>

            <Select
              value={selectedAlgorithm}
              onValueChange={setSelectedAlgorithm}
              disabled={isVisualizing}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Algorithm" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="bfs">BFS</SelectItem>
                <SelectItem value="dfs">DFS</SelectItem>
                <SelectItem value="a_star">A*</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              Patterns
            </Label>

            <Popover>
              <PopoverTrigger
                disabled={isVisualizing}
                asChild
              >
                <Button variant='secondary'>Pattern</Button>
              </PopoverTrigger>

              <PopoverContent className="z-100">
                <div className="flex flex-col gap-2">
                  <Button className="cursor-pointer" onClick={() => runPattern("simple_zig_zag_pattern")}>Simple zig zag pattern</Button>

                  <Button className="cursor-pointer" onClick={() => runPattern("recursive_division")}>Recursive division</Button>

                  <Button className="cursor-pointer" onClick={() => runPattern('random_filling')}>Random filling</Button>
{/*
                  <Button className="cursor-pointer relative" onClick={() => runPattern("recursive_division_vs")} disabled>
                    Recursive division (vertical skew)

                    <Badge className="absolute -top-1/12 -right-2">Soon</Badge>
                  </Button>

                  <Button className="cursor-pointer relative" onClick={() => runPattern("recursive_division_hs")} disabled>
                    Recursive division (horizontal skew)

                    <Badge className="absolute -top-1/12 -right-2">Soon</Badge>
                  </Button>

                  <Button className="cursor-pointer relative" onClick={() => runPattern("basic_random_maze")} disabled>
                    Basic random maze

                    <Badge className="absolute -top-1/12 -right-2">Soon</Badge>
                  </Button> */}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className='flex flex-col gap-3 w-30'>
            <Label>
              Speed: { illustrationSpeed / 1000 }s
            </Label>

            <div className="py-3">
              <Slider
                onValueChange={(e) => onIllustrationSpeedChange(e[0])}
                defaultValue={[DEFAULT_ILLUSTRATION_SPEED]}
                min={MIN_ILLUSTRATION_SPEED}
                max={MAX_ILLUSTRATION_SPEED}
                step={ILLUSTATION_SPEED_RANGE_STEP}
                className='flex-1'
                disabled={isVisualizing}
              />
            </div>
          </div>

          <Button
            onClick={onClickHandler}
            disabled={isVisualizing}
            variant='positive'
          >
            Run
          </Button>

          <Button
            onClick={() => clearGrid({clearWalls: true})}
            disabled={isVisualizing}
            variant='destructive'
          >
            Clear grid
          </Button>
        </CardHeader>

        <CardContent className="h-full overflow-hidden">
          {/** FIXME: Event does not want to be any */}
          <div
            ref={gridRef}
            onMouseDown={(e: any) => onGridMouseDown(e)}
            className="h-full flex flex-col justify-start"
            autoFocus
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
