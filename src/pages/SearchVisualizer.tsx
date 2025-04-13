import {
  useCallback,
  useEffect,
  useState
} from "react"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  // MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  getMaxNumber,
  getRandomNumber
} from "@/lib/utils"
import {
  BAR_HEIGHT,

  ARRAY_DEFAULT_SIZE,
  ARRAY_MAX_VALUE,
  ARRAY_MIN_VALUE,
  // BAR_MIN_HEIGHT
} from "@/lib/constants"

function SearchVisualizer() {
  // const [selectedAlgorithm, setSelectedAlgorithm] = useState()
  const [ arraySize, setArraySize ] = useState(ARRAY_DEFAULT_SIZE)

  const [ bars, setBars ] = useState<number[]>([])
  const [ maxBar, setMaxBar ] = useState<number>(-Infinity)

  function onArraySizeChange(newSize: number) {
    setArraySize(newSize)
  }

  const generateBars = useCallback(
    (barsCount: number) => {
      const generatedBars: number[] = []

      for (let i = 0; i < barsCount; ++i) {
        generatedBars
          .push(
            getRandomNumber(ARRAY_MIN_VALUE, ARRAY_MAX_VALUE)
          )
      }

      setBars(generatedBars)
      updateMaxBar(generatedBars)
    },
    []
  )

  function updateMaxBar(bars: number[]) {
    const currentMaxBar = getMaxNumber(bars)

    setMaxBar(currentMaxBar)
  }

  function calculateBarHeight(bar: number) {
    return BAR_HEIGHT * (bar / maxBar)
    // TODO: Probably we need min height, but need to test
    // return Math.max(
    //   BAR_MIN_HEIGHT,
    //   BAR_HEIGHT * (bar / maxBar)
    // )
  }

  useEffect(
    () => {
      generateBars(arraySize)
    },
    [generateBars]
  )

  /**
   * TODO: Array contains numbers  that <= 0
   */
  return(
    <div className="p-3 h-screen">
      <Card className="h-full">
        <CardHeader className="flex">
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>Algorithm</MenubarTrigger>

              <MenubarContent>
                {/* <MenubarShortcut>⌘T</MenubarShortcut> */}
                <MenubarItem>Linear Search</MenubarItem>

                <MenubarSeparator />

                <MenubarItem>Binary search</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          <Input
            value={arraySize}
            onChange={e => onArraySizeChange(parseInt(e.target.value))}
            type="number"
            className="w-min"
            placeholder="Array size"
            min={0}
            max={1000}
          />

          <Button
            variant='secondary'
            onClick={() => generateBars(arraySize)}
          >
            Regenerate bars
          </Button>

          <Button
            variant='positive'
          >
            Run
          </Button>
        </CardHeader>
        <CardContent className="h-full overflow-x-auto">
          <div className="flex items-start gap-2 gap-y-5 h-full justify-center flex-wrap mx-auto">
            {
              bars.map(
                (bar, barIndex) => (
                  <div
                    key={barIndex}
                    className="transition-all p-2 bg-white text-black flex items-center justify-center w-10"
                    style={
                      {
                        height: calculateBarHeight(bar) + 'px'
                      }
                    }
                  >
                    { bar }
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

export default SearchVisualizer