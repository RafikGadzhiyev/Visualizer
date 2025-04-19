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
import { GridItem } from "@/lib/types"
import clsx from "clsx"

function PathFinding() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bfs')

  const [grid, setGrid] = useState<Array<GridItem[]>>([])

  const gridRef = useRef<HTMLDivElement | null>(null)

  function initGrid() {
    const preparedGrid = [];

    for (let i = 0; i < GRID_ROWS; ++i) {
      const row = []

      for (let j = 0; j < GRID_COLS; ++j) {
        row.push(
          {
            key: i + '__' + j,
            blocked: false,
            visited: false,
            startPoint: false,
            endPoint: false,
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

  useEffect(
    () => {
      initGrid()
    },
    []
  )

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
              <SelectItem value="dijkstra">dijkstra</SelectItem>
              <SelectItem value="a_star">A*</SelectItem>
            </SelectContent>
          </Select>
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
                                  'select-none border h-full min-h-2 flex-1': true,
                                  'bg-white border-black': !gridItem.blocked && !gridItem.visited,
                                  'bg-slate-700': gridItem.blocked
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
