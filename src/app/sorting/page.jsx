"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Play, Pause, RotateCcw, Home, Info } from "lucide-react"
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
  Darker surfaces : #0f172a     Hover/active : #334155
  Unsorted bars   : #9fb1e8   Comparing : #ffc765   Sorted : #7ee0bd
  Text            : #f4f7fb / #dbe5f1      Button text : #0f172a
*/

/* ---------- Step recorder: every sort records "frames" for the animation ---------- */
function recorder(arr) {
  const a = arr.slice()
  const f = []
  const push = (c = [], s = []) => f.push({ a: a.slice(), c, s: s.slice() })
  const done = () => {
    f.push({ a: a.slice(), c: [], s: a.map((_, i) => i) })
    return f
  }
  const swap = (i, j) => {
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return { a, push, done, swap }
}

const SORTERS = {
  bubble(arr) {
    const { a, push, done, swap } = recorder(arr)
    const n = a.length
    const s = []
    for (let i = 0; i < n - 1; i++) {
      let swapped = false
      for (let j = 0; j < n - i - 1; j++) {
        push([j, j + 1], s)
        if (a[j] > a[j + 1]) {
          swap(j, j + 1)
          swapped = true
          push([j, j + 1], s)
        }
      }
      s.push(n - i - 1)
      if (!swapped) break
    }
    return done()
  },

  selection(arr) {
    const { a, push, done, swap } = recorder(arr)
    const n = a.length
    const s = []
    for (let i = 0; i < n - 1; i++) {
      let m = i
      for (let j = i + 1; j < n; j++) {
        push([m, j], s)
        if (a[j] < a[m]) m = j
      }
      if (m !== i) {
        swap(i, m)
        push([i, m], s)
      }
      s.push(i)
    }
    return done()
  },

  insertion(arr) {
    const { a, push, done, swap } = recorder(arr)
    for (let i = 1; i < a.length; i++) {
      let j = i
      while (j > 0) {
        push([j - 1, j])
        if (a[j - 1] > a[j]) {
          swap(j - 1, j)
          push([j - 1, j])
          j--
        } else break
      }
    }
    return done()
  },

  quick(arr) {
    const { a, push, done, swap } = recorder(arr)
    const s = []
    const qs = (lo, hi) => {
      if (lo > hi) return
      if (lo === hi) {
        s.push(lo)
        return
      }
      const pivot = a[hi]
      let i = lo
      for (let j = lo; j < hi; j++) {
        push([j, hi], s)
        if (a[j] < pivot) {
          if (i !== j) {
            swap(i, j)
            push([i, j], s)
          }
          i++
        }
      }
      if (i !== hi) {
        swap(i, hi)
        push([i, hi], s)
      }
      s.push(i)
      qs(lo, i - 1)
      qs(i + 1, hi)
    }
    qs(0, a.length - 1)
    return done()
  },

  merge(arr) {
    const { a, push, done } = recorder(arr)
    const ms = (l, r) => {
      if (r - l < 1) return
      const m = (l + r) >> 1
      ms(l, m)
      ms(m + 1, r)
      const left = a.slice(l, m + 1)
      const right = a.slice(m + 1, r + 1)
      let i = 0,
        j = 0,
        k = l
      while (i < left.length && j < right.length) {
        push([l + i, m + 1 + j])
        a[k++] = left[i] <= right[j] ? left[i++] : right[j++]
        push([k - 1])
      }
      while (i < left.length) {
        a[k++] = left[i++]
        push([k - 1])
      }
      while (j < right.length) {
        a[k++] = right[j++]
        push([k - 1])
      }
    }
    ms(0, a.length - 1)
    return done()
  },

  heap(arr) {
    const { a, push, done, swap } = recorder(arr)
    const n = a.length
    const s = []
    const sift = (size, start) => {
      let i = start
      while (true) {
        let largest = i
        const l = 2 * i + 1
        const r = 2 * i + 2
        if (l < size) {
          push([largest, l], s)
          if (a[l] > a[largest]) largest = l
        }
        if (r < size) {
          push([largest, r], s)
          if (a[r] > a[largest]) largest = r
        }
        if (largest === i) break
        swap(i, largest)
        push([i, largest], s)
        i = largest
      }
    }
    for (let i = (n >> 1) - 1; i >= 0; i--) sift(n, i)
    for (let end = n - 1; end > 0; end--) {
      swap(0, end)
      push([0, end], s)
      s.push(end)
      sift(end, 0)
    }
    return done()
  },

  counting(arr) {
    const { a, push, done } = recorder(arr)
    const max = Math.max(...a)
    const count = new Array(max + 1).fill(0)
    for (let i = 0; i < a.length; i++) {
      count[a[i]]++
      push([i])
    }
    let k = 0
    for (let v = 0; v <= max; v++) {
      while (count[v]-- > 0) {
        a[k] = v
        push([k])
        k++
      }
    }
    return done()
  },

  radix(arr) {
    const { a, push, done } = recorder(arr)
    const n = a.length
    const max = Math.max(...a)
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
      const out = new Array(n)
      const cnt = new Array(10).fill(0)
      for (let i = 0; i < n; i++) {
        cnt[Math.floor(a[i] / exp) % 10]++
        push([i])
      }
      for (let i = 1; i < 10; i++) cnt[i] += cnt[i - 1]
      for (let i = n - 1; i >= 0; i--) {
        const d = Math.floor(a[i] / exp) % 10
        out[--cnt[d]] = a[i]
      }
      for (let i = 0; i < n; i++) {
        a[i] = out[i]
        push([i])
      }
    }
    return done()
  },
}

const INFO = {
  quick: { name: "Quick Sort", time: "O(n log n) average, O(n²) worst", space: "O(log n)", text: "Picks a pivot, moves smaller values to its left and larger to its right, then repeats on both sides." },
  merge: { name: "Merge Sort", time: "O(n log n)", space: "O(n)", text: "Splits the array in halves, sorts each half, then merges the sorted halves together." },
  heap: { name: "Heap Sort", time: "O(n log n)", space: "O(1)", text: "Builds a max-heap, then repeatedly moves the largest value to the end." },
  bubble: { name: "Bubble Sort", time: "O(n²)", space: "O(1)", text: "Compares neighbours and swaps them if they are in the wrong order. Large values bubble to the end." },
  selection: { name: "Selection Sort", time: "O(n²)", space: "O(1)", text: "Finds the smallest remaining value and places it at the front, one position at a time." },
  insertion: { name: "Insertion Sort", time: "O(n²)", space: "O(1)", text: "Takes each value and inserts it into its correct place among the values before it." },
  counting: { name: "Counting Sort", time: "O(n + k)", space: "O(k)", text: "Counts how many times each value appears, then writes the values back in order." },
  radix: { name: "Radix Sort", time: "O(d · (n + b))", space: "O(n + b)", text: "Sorts numbers digit by digit, from the least significant digit to the most significant." },
}

export default function SortingPage() {
  const [algo, setAlgo] = useState("quick")
  const [size, setSize] = useState(20)
  const [speed, setSpeed] = useState(50)
  const [array, setArray] = useState([])
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const frames = useRef([])

  const newArray = useCallback((n) => {
    setPlaying(false)
    frames.current = []
    setStep(0)
    setArray(Array.from({ length: n }, () => 5 + Math.floor(Math.random() * 95)))
  }, [])

  // New random array on first load and whenever size or algorithm changes
  useEffect(() => {
    newArray(size)
  }, [size, algo, newArray])

  // Playback loop
  useEffect(() => {
    if (!playing) return
    const delay = Math.max(4, 300 - speed * 3)
    const t = setTimeout(() => {
      if (step >= frames.current.length - 1) {
        setPlaying(false)
        return
      }
      setStep((s) => s + 1)
    }, delay)
    return () => clearTimeout(t)
  }, [playing, step, speed])

  const finished = frames.current.length > 0 && step >= frames.current.length - 1

  const togglePlay = () => {
    if (playing) {
      setPlaying(false)
      return
    }
    if (finished) return
    if (frames.current.length === 0) {
      frames.current = SORTERS[algo](array)
      setStep(0)
    }
    setPlaying(true)
  }

  const frame = frames.current[step] ?? { a: array, c: [], s: [] }
  const showNumbers = frame.a.length <= 30

  const barColor = (i) => {
    if (frame.c.includes(i)) return "bg-[#ffc765] shadow-[0_0_14px_rgba(255,199,101,0.7)]"
    if (frame.s.includes(i)) return "bg-[#7ee0bd]"
    return "bg-[#9fb1e8]"
  }

  const total = Math.max(frames.current.length - 1, 0)
  const status = finished ? "Sorted" : playing ? "Sorting" : frames.current.length ? "Paused" : "Ready"
  const statusColor = finished ? "bg-[#7ee0bd]" : playing ? "bg-[#ffc765]" : "bg-[#9fb1e8]"

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
          <h1 className={`${heading.className} text-3xl md:text-5xl font-bold tracking-tight`}>Sorting Visualizer</h1>
          <div className="w-[116px] hidden sm:block" aria-hidden="true" />
        </header>

        {/* Controls */}
        <Card className="mb-6 rounded-2xl border border-white/15 bg-[#1e293b]/70 shadow-xl backdrop-blur">
          <CardContent className="p-5 md:p-6">
            <div className="grid gap-5 md:grid-cols-[auto_1fr_1fr_auto] md:items-end">
              {/* Algorithm */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[#dbe5f1]">Algorithm</span>
                <div className="flex items-center gap-2">
                  <Select value={algo} onValueChange={setAlgo} disabled={playing}>
                    <SelectTrigger className="w-48 border-white/25 bg-[#0f172a]/60 text-[#f4f7fb]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={`${body.className} z-50 border border-white/20 bg-[#0f172a] text-[#f4f7fb] shadow-2xl`}
                    >
                      {Object.entries(INFO).map(([key, v]) => (
                        <SelectItem
                          key={key}
                          value={key}
                          className="cursor-pointer text-[#f4f7fb] focus:bg-[#334155] focus:text-white data-[state=checked]:text-[#ffc765]"
                        >
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => setShowInfo((v) => !v)}
                    className={`border border-white/25 text-[#f4f7fb] ${showInfo ? "bg-[#334155]" : "bg-[#0f172a]/60 hover:bg-[#334155]"}`}
                    aria-label="Algorithm info"
                    aria-pressed={showInfo}
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Size */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-[#f4f7fb]">Size</span>
                  <span className="rounded-lg bg-[#0f172a] px-3 py-1 text-lg font-semibold tabular-nums">{size}</span>
                </div>
                <Slider
                  value={[size]}
                  min={5}
                  max={50}
                  step={1}
                  onValueChange={(v) => setSize(v[0])}
                  disabled={playing}
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
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={(v) => setSpeed(v[0])}
                  className={sliderStyle}
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={togglePlay}
                  disabled={finished}
                  className="h-11 w-14 bg-[#7ee0bd] hover:bg-[#a0ebd0] text-[#0f172a] font-semibold disabled:opacity-40"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button
                  onClick={() => newArray(size)}
                  className="h-11 w-14 bg-[#ffc765] hover:bg-[#ffd68a] text-[#0f172a] font-semibold"
                  aria-label="New array"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {showInfo && (
              <div className="mt-5 rounded-xl border border-white/15 bg-[#0f172a]/50 p-4 text-sm leading-relaxed text-[#dbe5f1]">
                <p className="mb-1 text-base font-semibold text-[#f4f7fb]">{INFO[algo].name}</p>
                <p className="mb-3 max-w-2xl">{INFO[algo].text}</p>
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-lg bg-[#ffc765]/15 px-3 py-1 text-[#ffc765]">Time: {INFO[algo].time}</span>
                  <span className="rounded-lg bg-[#7ee0bd]/15 px-3 py-1 text-[#7ee0bd]">Space: {INFO[algo].space}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="rounded-2xl border border-white/15 bg-[#1e293b]/70 shadow-xl backdrop-blur">
          <CardContent className="p-4 md:p-6">
            {/* Status row */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-4">
                <span className={`${heading.className} text-2xl font-bold`}>{INFO[algo].name}</span>
                <span className="flex items-center gap-2 rounded-full bg-[#0f172a]/60 px-3 py-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${statusColor} ${playing ? "animate-pulse" : ""}`} />
                  {status}
                </span>
              </div>
              <span className="tabular-nums text-[#dbe5f1]">
                Step {Math.min(step, total)} / {total}
              </span>
            </div>

            {/* Bars */}
            <div className="flex h-[380px] items-end justify-center gap-1 rounded-xl bg-[#0f172a]/50 px-3 pb-3 pt-4 ring-1 ring-white/10">
              {frame.a.map((value, i) => (
                <div
                  key={i}
                  className="flex h-full flex-col items-center justify-end"
                  style={{ width: `${Math.max(100 / (frame.a.length + 4), 1.2)}%`, maxWidth: "52px" }}
                >
                  {showNumbers && (
                    <span className="mb-1 text-[11px] font-semibold tabular-nums text-[#f4f7fb]">{value}</span>
                  )}
                  <div
                    className={`w-full rounded-t-md transition-[background-color,box-shadow] duration-100 ${barColor(i)}`}
                    style={{ height: `${value * 0.85}%` }}
                  />
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-6 text-sm text-[#f4f7fb]">
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-sm bg-[#9fb1e8]" /> Unsorted
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-sm bg-[#ffc765]" /> Comparing
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-sm bg-[#7ee0bd]" /> Sorted
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}