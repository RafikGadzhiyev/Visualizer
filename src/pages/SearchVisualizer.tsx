import {
  useCallback,
  useEffect,
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

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"


import {
  getMaxNumber,
  getRandomNumber, sleep
} from "@/lib/utils"
import {
  BAR_HEIGHT,

  ARRAY_DEFAULT_SIZE,
  ARRAY_MAX_VALUE,
  ARRAY_MIN_VALUE,
  DEFAULT_ILLUSTRATION_SPEED,
  MIN_ILLUSTRATION_SPEED,
  MAX_ILLUSTRATION_SPEED,
} from "@/lib/constants"
import {clsx} from "clsx";

function SearchVisualizer() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('linear_search')
  const [illustrationSpeed, setIllustrationSpeed] = useState<number>(DEFAULT_ILLUSTRATION_SPEED)

  const [target, setTarget] = useState<number>(0)

  const [targetIndicies, setTargetIndicies] = useState(new Set())
  const [currentBarIndicies, setCurrentBarIndicies] = useState(new Set())
  const [borderIndicies, setBorderIndicies] = useState(new Set())

  const [ arraySize, setArraySize ] = useState(ARRAY_DEFAULT_SIZE)
  const [ bars, setBars ] = useState<number[]>([])
  const [ maxBar, setMaxBar ] = useState<number>(-Infinity)

  function onArraySizeChange(newSize: number) {
    setArraySize(newSize)
  }

  function onTargetChange(newTarget: number) {
    setTarget(newTarget)
  }

  function onIllustrationSpeedChange(newIllustrationSpeed: number) {
    setIllustrationSpeed(newIllustrationSpeed)
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

      setTargetIndicies(
        prevIndices => {
          prevIndices.clear()

          return prevIndices
        }
      )
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

  async function linearSearch(bars: number[], target: number) {
    setTargetIndicies(new Set())

    for (let i = 0; i < bars.length; ++i) {
      setCurrentBarIndicies(
        () => {
          return new Set([i])
        }
      )

      if (bars[i] === target) {
        setTargetIndicies(
          prevTargetIndicies => {
            prevTargetIndicies.add(i);
            return prevTargetIndicies;
          }
        )
        return i
      }

      await sleep(illustrationSpeed)
    }

    setCurrentBarIndicies(new Set())
    setTargetIndicies(new Set())
    return -1;
  }

  async function binarySearch(bars: number[], target: number) {
    setTargetIndicies(new Set())
    setBorderIndicies(new Set())
    setCurrentBarIndicies(new Set())

    setBars(
      () => bars
      .sort(
        (a, b) => a - b
      )
    )

    await sleep(illustrationSpeed)

    let left = 0;
    let right = bars.length - 1;

    while (left <= right) {
      const middle = Math.floor((right - left) / 2 + left)

      setBorderIndicies(
        () => {
          return new Set([left, right])
        }
      )

      setCurrentBarIndicies(
        () => {
          return new Set([middle])
        }
      )


      await sleep(illustrationSpeed)

      const num = bars[middle]

      if (num === target) {
        setTargetIndicies(
          () => new Set([middle])
        )

        return middle
      }

      if (num < target) {
        left = middle + 1
      }
      else {
        right = middle - 1;
      }
    }

    setCurrentBarIndicies(new Set())
    setBorderIndicies(new Set())
    setTargetIndicies(new Set())
    return -1;
  }

  function runSearch() {
    if (selectedAlgorithm === 'linear_search') {
      linearSearch(bars, target)
    }
    else {
      binarySearch(bars, target)
    }
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
              <SelectItem value="linear_search">Linear Search</SelectItem>
              <SelectItem value="binary_search">Binary search</SelectItem>
            </SelectContent>
          </Select>

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

          <Input
            value={target}
            onChange={e => onTargetChange(parseInt(e.target.value))}
            type="number"
            className="w-min"
            placeholder="Target number"
          />

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
            onClick={() => runSearch()}
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
                    className={clsx(
                      'transition-all p-2 flex items-center justify-center w-10',
                      {
                        'bg-white text-black': !targetIndicies.has(barIndex) && !currentBarIndicies.has(barIndex) && !borderIndicies.has(barIndex),
                        'bg-indigo-300': borderIndicies.has(barIndex),
                        'bg-positive': targetIndicies.has(barIndex),
                        'bg-destructive': currentBarIndicies.has(barIndex),
                      }
                    )}
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
