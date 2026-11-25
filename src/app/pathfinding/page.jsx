"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Play, RotateCcw, Home } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Cormorant_Garamond, Outfit } from "next/font/google"

// Heading font (classic serif) and body font (clean rounded sans)
const heading = Cormorant_Garamond({ subsets: ["latin"], weight: ["600", "700"] })
const body = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] })

// Slider: translucent track, mint filled part, white thumb with mint ring
const sliderStyle =
  "py-2 " +
  // track (full line)
  "[&>span:first-child]:h-1.5 [&>span:first-child]:bg-white/20 " +
  // filled part
  "[&>span:first-child>span]:bg-[#7ee0bd] " +
  // thumb
  "[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-[3px] " +
  "[&_[role=slider]]:border-[#7ee0bd] [&_[role=slider]]:bg-white " +
  "[&_[role=slider]]:shadow-lg [&_[role=slider]]:transition-transform " +
  "[&_[role=slider]]:hover:scale-110 " +
  "[&_[role=slider]]:focus-visible:ring-2 [&_[role=slider]]:focus-visible:ring-[#7ee0bd]/50"

/*
  PALETTE
  Page background : dark slate  #0f172a -> #162033 -> #1e293b
  Panels          : #1e293b
  Grid box        : #0b1220     Empty cell : #1e293b   Wall : #020617
  Start #e6a93a   End #e8607a   Visited #475569   Path #2fb58a
*/

const ALGORITHMS = {
  bfs: "Breadth-First Search",
  dfs: "Depth-First Search",
  astar: "A* Search",
}

const GRID_SIZE = 25
const NODE_TYPES = {
  EMPTY: 0,
  WALL: 1,
  START: 2,
  END: 3,
  VISITED: 4,
  PATH: 5,
}

export default function PathfindingPage() {
  const [grid, setGrid] = useState([])
  const [speed, setSpeed] = useState(50)
  const [cellSize, setCellSize] = useState(24)
  const [algorithm, setAlgorithm] = useState("bfs")
  const [isPlaying, setIsPlaying] = useState(false)
  const [startNode, setStartNode] = useState({ row: 5, col: 5 })
  const [endNode, setEndNode] = useState({ row: 15, col: 20 })
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawMode, setDrawMode] = useState("wall")

  const initializeGrid = useCallback(() => {
    const newGrid = Array(GRID_SIZE)
      .fill()
      .map(() => Array(GRID_SIZE).fill(NODE_TYPES.EMPTY))
    newGrid[startNode.row][startNode.col] = NODE_TYPES.START
    newGrid[endNode.row][endNode.col] = NODE_TYPES.END
    setGrid(newGrid)
  }, [startNode, endNode])

  useEffect(() => {
    initializeGrid()
  }, [initializeGrid])

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const getNeighbors = (row, col) => {
    const neighbors = []
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]

    for (const [dr, dc] of directions) {
      const newRow = row + dr
      const newCol = col + dc

      if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
        neighbors.push({ row: newRow, col: newCol })
      }
    }

    return neighbors
  }

  const bfs = async () => {
    const queue = [startNode]
    const visited = new Set()
    const parent = new Map()

    visited.add(`${startNode.row},${startNode.col}`)

    while (queue.length > 0) {
      const current = queue.shift()

      if (current.row === endNode.row && current.col === endNode.col) {
        await reconstructPath(parent, current)
        return true
      }

      const neighbors = getNeighbors(current.row, current.col)

      for (const neighbor of neighbors) {
        const key = `${neighbor.row},${neighbor.col}`

        if (!visited.has(key) && grid[neighbor.row][neighbor.col] !== NODE_TYPES.WALL) {
          visited.add(key)
          parent.set(key, current)
          queue.push(neighbor)

          if (grid[neighbor.row][neighbor.col] === NODE_TYPES.EMPTY) {
            setGrid((prev) => {
              const newGrid = [...prev]
              newGrid[neighbor.row][neighbor.col] = NODE_TYPES.VISITED
              return newGrid
            })
            await sleep(101 - speed)
          }
        }
      }
    }

    return false
  }

  const dfs = async () => {
    const stack = [startNode]
    const visited = new Set()
    const parent = new Map()

    while (stack.length > 0) {
      const current = stack.pop()
      const key = `${current.row},${current.col}`

      if (visited.has(key)) continue
      visited.add(key)

      if (current.row === endNode.row && current.col === endNode.col) {
        await reconstructPath(parent, current)
        return true
      }

      if (grid[current.row][current.col] === NODE_TYPES.EMPTY) {
        setGrid((prev) => {
          const newGrid = [...prev]
          newGrid[current.row][current.col] = NODE_TYPES.VISITED
          return newGrid
        })
        await sleep(101 - speed)
      }

      const neighbors = getNeighbors(current.row, current.col)

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row},${neighbor.col}`

        if (!visited.has(neighborKey) && grid[neighbor.row][neighbor.col] !== NODE_TYPES.WALL) {
          parent.set(neighborKey, current)
          stack.push(neighbor)
        }
      }
    }

    return false
  }

  const reconstructPath = async (parent, endNode) => {
    const path = []
    let current = endNode

    while (current) {
      path.unshift(current)
      const key = `${current.row},${current.col}`
      current = parent.get(key)
    }

    for (const node of path) {
      if (grid[node.row][node.col] === NODE_TYPES.VISITED) {
        setGrid((prev) => {
          const newGrid = [...prev]
          newGrid[node.row][node.col] = NODE_TYPES.PATH
          return newGrid
        })
        await sleep(101 - speed)
      }
    }
  }

  const startPathfinding = async () => {
    setIsPlaying(true)

    try {
      if (algorithm === "bfs") {
        await bfs()
      } else if (algorithm === "dfs") {
        await dfs()
      }
    } catch (error) {
      console.error("Pathfinding interrupted:", error)
    }

    setIsPlaying(false)
  }

  const clearPath = () => {
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) => (cell === NODE_TYPES.VISITED || cell === NODE_TYPES.PATH ? NODE_TYPES.EMPTY : cell)),
      ),
    )
  }

  const handleCellClick = (row, col) => {
    if (isPlaying) return

    setGrid((prev) => {
      const newGrid = [...prev]

      if (drawMode === "wall") {
        if (newGrid[row][col] === NODE_TYPES.EMPTY) {
          newGrid[row][col] = NODE_TYPES.WALL
        } else if (newGrid[row][col] === NODE_TYPES.WALL) {
          newGrid[row][col] = NODE_TYPES.EMPTY
        }
      }

      return newGrid
    })
  }

  const getCellColor = (cellType) => {
    switch (cellType) {
      case NODE_TYPES.WALL:
        return "bg-[#020617] border-[#9fb1e8]/40"
      case NODE_TYPES.START:
        return "bg-[#e6a93a] border-[#e6a93a]"
      case NODE_TYPES.END:
        return "bg-[#e8607a] border-[#e8607a]"
      case NODE_TYPES.VISITED:
        return "bg-[#475569] border-[#64748b]"
      case NODE_TYPES.PATH:
        return "bg-[#2fb58a] border-[#2fb58a]"
      default:
        return "bg-[#1e293b] border-white/10"
    }
  }

  return (
    <div className={`${body.className} min-h-screen bg-gradient-to-br from-[#0f172a] via-[#162033] to-[#1e293b] text-[#f4f7fb]`}>
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between gap-4">
          <Link href="/">
            <Button className="h-11 rounded-full border border-white/25 bg-[#0f172a] px-5 text-base font-semibold text-[#f4f7fb] shadow-lg transition-colors hover:bg-[#ffc765] hover:text-[#0f172a]">
              <Home className="mr-2 h-5 w-5" /> Home
            </Button>
          </Link>
          <h1 className={`${heading.className} text-3xl md:text-5xl font-bold tracking-tight`}>Pathfinding Visualizer</h1>
          <div className="w-[116px] hidden sm:block" aria-hidden="true" />
        </header>

        {/* Controls */}
        <Card className="mb-6 rounded-2xl border border-white/15 bg-[#1e293b]/70 shadow-xl backdrop-blur">
          <CardContent className="p-5 md:p-6">
            <div className="grid gap-5 md:grid-cols-[auto_1fr_1fr_auto] md:items-end">
              {/* Algorithm */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[#dbe5f1]">Algorithm</span>
                <Select value={algorithm} onValueChange={setAlgorithm} disabled={isPlaying}>
                  <SelectTrigger className="w-56 border-white/25 bg-[#0f172a]/60 text-[#f4f7fb]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={`${body.className} z-50 border border-white/20 bg-[#0f172a] text-[#f4f7fb] shadow-2xl`}
                  >
                    {Object.entries(ALGORITHMS).map(([key, name]) => (
                      <SelectItem
                        key={key}
                        value={key}
                        className="cursor-pointer text-[#f4f7fb] focus:bg-[#334155] focus:text-white data-[state=checked]:text-[#ffc765]"
                      >
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Size (cell size) */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-[#f4f7fb]">Size</span>
                  <span className="rounded-lg bg-[#0f172a] px-3 py-1 text-lg font-semibold tabular-nums">{cellSize}</span>
                </div>
                <Slider
                  value={[cellSize]}
                  min={14}
                  max={36}
                  step={1}
                  onValueChange={(v) => setCellSize(v[0])}
                  className={sliderStyle}
                />
              </div>

              {/* Speed */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-[#f4f7fb]">Speed</span>
                  <span className="rounded-lg bg-[#0f172a] px-3 py-1 text-lg font-semibold tabular-nums">{speed}</span>
                </div>
                <Slider
                  value={[speed]}
                  onValueChange={(value) => setSpeed(value[0])}
                  max={100}
                  min={1}
                  step={1}
                  className={sliderStyle}
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={startPathfinding}
                  disabled={isPlaying}
                  className="h-11 bg-[#7ee0bd] px-4 font-semibold text-[#0f172a] hover:bg-[#a0ebd0] disabled:opacity-40"
                >
                  <Play className="mr-2 h-5 w-5" /> Start
                </Button>
                <Button
                  onClick={clearPath}
                  disabled={isPlaying}
                  className="h-11 border border-white/25 bg-[#0f172a] px-4 font-semibold text-[#f4f7fb] hover:bg-[#334155] disabled:opacity-40"
                >
                  Clear Path
                </Button>
                <Button
                  onClick={initializeGrid}
                  disabled={isPlaying}
                  className="h-11 w-14 bg-[#ffc765] font-semibold text-[#0f172a] hover:bg-[#ffd68a] disabled:opacity-40"
                  aria-label="Reset grid"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid */}
        <Card className="rounded-2xl border border-white/15 bg-[#1e293b]/70 shadow-xl backdrop-blur">
          <CardContent className="p-4 md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-4">
                <span className={`${heading.className} text-2xl font-bold`}>{ALGORITHMS[algorithm]}</span>
                <span className="flex items-center gap-2 rounded-full bg-[#0f172a]/60 px-3 py-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${isPlaying ? "animate-pulse bg-[#ffc765]" : "bg-[#9fb1e8]"}`} />
                  {isPlaying ? "Searching" : "Ready"}
                </span>
              </div>
              <span className="text-[#dbe5f1]">Click a cell to add or remove a wall</span>
            </div>

            <div className="overflow-x-auto rounded-xl bg-[#0b1220] p-4 ring-1 ring-white/10">
              <div
                className="mx-auto grid w-fit gap-1"
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)` }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <motion.div
                      key={`${rowIndex}-${colIndex}`}
                      className={`cursor-pointer rounded-[3px] border ${getCellColor(cell)}`}
                      style={{ width: cellSize, height: cellSize }}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  )),
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-6 text-sm text-[#f4f7fb]">
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-sm bg-[#e6a93a]" /> Start
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-sm bg-[#e8607a]" /> End
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-sm border border-[#9fb1e8]/40 bg-[#020617]" /> Wall
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-sm border border-[#64748b] bg-[#475569]" /> Visited
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-sm bg-[#2fb58a]" /> Path
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}