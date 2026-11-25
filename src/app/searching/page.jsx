"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Search, RotateCcw, Home } from "lucide-react"
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
  Unsearched      : #9fb1e8   Checking : #ffc765   Found : #7ee0bd   Skipped : #475569
  Text            : #f4f7fb / #dbe5f1      Button text : #0f172a
*/

/* ---------- Each search records frames for the animation ----------
   c     = index being checked (-1 for none)
   found = index of the match (-1 for none)
   lo/hi = the range still in play; bars outside it are shown as skipped
   end   = last frame of the search                                      */
const SEARCHERS = {
  linear(a, t) {
    const n = a.length
    const f = []
    for (let i = 0; i < n; i++) {
      f.push({ c: i, found: -1, lo: i, hi: n - 1, end: false })
      if (a[i] === t) {
        f.push({ c: i, found: i, lo: i, hi: n - 1, end: true })
        return f
      }
    }
    f.push({ c: -1, found: -1, lo: n, hi: n - 1, end: true })
    return f
  },

  binary(a, t) {
    let lo = 0
    let hi = a.length - 1
    const f = []
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      f.push({ c: mid, found: -1, lo, hi, end: false })
      if (a[mid] === t) {
        f.push({ c: mid, found: mid, lo: mid, hi: mid, end: true })
        return f
      }
      if (a[mid] < t) lo = mid + 1
      else hi = mid - 1
    }
    f.push({ c: -1, found: -1, lo: a.length, hi: a.length - 1, end: true })
    return f
  },
}

const NAMES = { linear: "Linear Search", binary: "Binary Search" }

export default function SearchingPage() {
  const [algo, setAlgo] = useState("linear")
  const [size, setSize] = useState(20)
  const [speed, setSpeed] = useState(50)
  const [array, setArray] = useState([])
  const [target, setTarget] = useState("")
  const [searched, setSearched] = useState(null)
  const [error, setError] = useState("")
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const frames = useRef([])

  // Values 1..n in random order. Binary search needs them sorted.
  const newArray = useCallback((n, kind) => {
    setPlaying(false)
    frames.current = []
    setStep(0)
    setError("")
    setSearched(null)
    const v = Array.from({ length: n }, (_, i) => i + 1)
    for (let i = v.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[v[i], v[j]] = [v[j], v[i]]
    }
    if (kind === "binary") v.sort((x, y) => x - y)
    setArray(v)
  }, [])

  useEffect(() => {
    newArray(size, algo)
  }, [size, algo, newArray])

  // Playback loop
  useEffect(() => {
    if (!playing) return
    const delay = Math.max(20, 600 - speed * 6)
    const t = setTimeout(() => {
      if (step >= frames.current.length - 1) {
        setPlaying(false)
        return
      }
      setStep((s) => s + 1)
    }, delay)
    return () => clearTimeout(t)
  }, [playing, step, speed])

  const handleSearch = () => {
    const t = Number(target)
    if (target.trim() === "" || !Number.isInteger(t)) {
      setError("Enter a whole number to search for.")
      return
    }
    setError("")
    setSearched(t)
    frames.current = SEARCHERS[algo](array, t)
    setStep(0)
    setPlaying(true)
  }

  const frame = frames.current[step] ?? null
  const foundIdx = frame ? frame.found : -1
  const ended = frame ? frame.end : false
  const notFound = ended && foundIdx < 0
  const showNumbers = array.length <= 30

  let message =
    algo === "binary"
      ? "Binary search works on a sorted list. Enter a number and press Search."
      : "Enter a number and press Search."
  if (frame) {
    if (foundIdx >= 0) message = `Found ${searched} at index ${foundIdx}`
    else if (notFound) message = `${searched} was not found in the list`
    else message = `Checking index ${frame.c}`
  }
  if (error) message = error

  const status = foundIdx >= 0 ? "Found" : notFound ? "Not found" : playing ? "Searching" : "Ready"
  const statusColor = foundIdx >= 0 ? "bg-[#7ee0bd]" : notFound ? "bg-[#ff8fa3]" : playing ? "bg-[#ffc765]" : "bg-[#9fb1e8]"

  const barClass = (i) => {
    if (frame) {
      if (i === foundIdx) return "bg-[#7ee0bd] shadow-[0_0_14px_rgba(126,224,189,0.7)]"
      if (i === frame.c && !frame.end) return "bg-[#ffc765] shadow-[0_0_14px_rgba(255,199,101,0.7)]"
      if (i < frame.lo || i > frame.hi) return "bg-[#475569]/70"
    }
    return "bg-[#9fb1e8]"
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
          <h1 className={`${heading.className} text-3xl md:text-5xl font-bold tracking-tight`}>Search Visualizer</h1>
          <div className="w-[116px] hidden sm:block" aria-hidden="true" />
        </header>

        {/* Controls */}
        <Card className="mb-6 rounded-2xl border border-white/15 bg-[#1e293b]/70 shadow-xl backdrop-blur">
          <CardContent className="p-5 md:p-6">
            <div className="grid gap-5 md:grid-cols-[auto_1fr_1fr_auto] md:items-end">
              {/* Algorithm */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[#dbe5f1]">Algorithm</span>
                <Select value={algo} onValueChange={setAlgo} disabled={playing}>
                  <SelectTrigger className="w-48 border-white/25 bg-[#0f172a]/60 text-[#f4f7fb]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={`${body.className} z-50 border border-white/20 bg-[#0f172a] text-[#f4f7fb] shadow-2xl`}
                  >
                    {Object.entries(NAMES).map(([key, name]) => (
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

              {/* Target and buttons */}
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  inputMode="numeric"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !playing && handleSearch()}
                  placeholder="Number"
                  aria-label="Number to search for"
                  className="h-11 w-28 rounded-md border border-white/25 bg-[#0f172a] px-3 text-lg text-[#f4f7fb] placeholder:text-[#dbe5f1]/60 focus:outline-none focus:ring-2 focus:ring-[#ffc765]"
                />
                <Button
                  onClick={handleSearch}
                  disabled={playing}
                  className="h-11 bg-[#7ee0bd] px-4 font-semibold text-[#0f172a] hover:bg-[#a0ebd0] disabled:opacity-40"
                >
                  <Search className="mr-2 h-5 w-5" /> Search
                </Button>
                <Button
                  onClick={() => newArray(size, algo)}
                  className="h-11 w-14 bg-[#ffc765] font-semibold text-[#0f172a] hover:bg-[#ffd68a]"
                  aria-label="New array"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message */}
        <Card className="mb-6 rounded-2xl border border-white/15 bg-[#1e293b]/70 shadow-xl backdrop-blur">
          <CardContent className="p-4 text-center text-lg font-semibold" aria-live="polite">
            {message}
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="rounded-2xl border border-white/15 bg-[#1e293b]/70 shadow-xl backdrop-blur">
          <CardContent className="p-4 md:p-6">
            {/* Status row */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-4">
                <span className={`${heading.className} text-2xl font-bold`}>{NAMES[algo]}</span>
                <span className="flex items-center gap-2 rounded-full bg-[#0f172a]/60 px-3 py-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${statusColor} ${playing ? "animate-pulse" : ""}`} />
                  {status}
                </span>
              </div>
              <span className="tabular-nums text-[#dbe5f1]">{array.length} items</span>
            </div>

            {/* Bars */}
            <div className="flex h-[380px] items-end justify-center gap-1 rounded-xl bg-[#0f172a]/50 px-3 pb-3 pt-4 ring-1 ring-white/10">
              {array.map((value, i) => (
                <div
                  key={i}
                  className="flex h-full items-end"
                  style={{ width: `${Math.max(100 / (array.length + 4), 1.2)}%`, maxWidth: "52px" }}
                >
                  <div
                    className={`flex w-full items-end justify-center rounded-t-md pb-1 transition-[background-color,box-shadow] duration-100 ${barClass(i)}`}
                    style={{ height: `${(value / array.length) * 92}%` }}
                  >
                    {showNumbers && (
                      <span className="text-[11px] font-semibold tabular-nums text-[#0f172a]">{value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-6 text-sm text-[#f4f7fb]">
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-sm bg-[#9fb1e8]" /> Unsearched
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-sm bg-[#ffc765]" /> Checking
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-sm bg-[#7ee0bd]" /> Found
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-sm bg-[#475569]/70" /> Skipped
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}