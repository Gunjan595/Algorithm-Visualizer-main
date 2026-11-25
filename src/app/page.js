import Link from "next/link"
import { Cormorant_Garamond } from "next/font/google"
import { ArrowUpDown, Search, Route } from "lucide-react"

// Classic serif used only for the main heading and the line under it
const classic = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
})

/*
  SOFT GLASS HOME PAGE
  Background : #2f4478 -> #3d4a8a -> #51448c with two soft glows
  Glass card : white/10 + blur + white/20 border
  Accents    : #9fb1e8 idle, #ffc765 active, #7ee0bd done
*/

/* ---------- Small previews shown inside each card ---------- */

function SortPreview() {
  const bars = [40, 70, 28, 90, 55, 80, 35, 65]
  return (
    <div className="flex h-20 items-end gap-1.5" aria-hidden="true">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`flex-1 rounded-t ${i === 3 ? "bg-[#ffc765]" : i > 5 ? "bg-[#7ee0bd]" : "bg-[#9fb1e8]"}`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  )
}

function SearchPreview() {
  const cells = [3, 8, 14, 21, 27, 34, 42, 56]
  return (
    <div className="flex h-20 items-center gap-1.5" aria-hidden="true">
      {cells.map((n, i) => (
        <div
          key={n}
          className={`flex h-10 flex-1 items-center justify-center rounded text-xs font-semibold ${
            i === 4
              ? "bg-[#7ee0bd] text-[#1d3350]"
              : i === 3
                ? "bg-[#ffc765] text-[#1d3350]"
                : "bg-white/15 text-[#dbe5f1]"
          }`}
        >
          {n}
        </div>
      ))}
    </div>
  )
}

function PathPreview() {
  const cols = 8
  const rows = 4
  const path = new Set([8, 9, 10, 18, 26, 27, 28, 29])
  const walls = new Set([2, 3, 11, 19, 20, 21, 12, 13])
  const start = 8
  const end = 29
  return (
    <div
      className="grid h-20 gap-1"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
      aria-hidden="true"
    >
      {Array.from({ length: cols * rows }, (_, i) => (
        <div
          key={i}
          className={`rounded-sm ${
            i === start
              ? "bg-[#ffc765]"
              : i === end
                ? "bg-[#ff8fa3]"
                : path.has(i)
                  ? "bg-[#7ee0bd]"
                  : walls.has(i)
                    ? "bg-[#1d3350]/70"
                    : "bg-white/15"
          }`}
        />
      ))}
    </div>
  )
}

const TOOLS = [
  {
    href: "/sorting",
    title: "Sorting",
    text: "Eight algorithms, from Bubble to Radix, with a step counter and speed control.",
    icon: ArrowUpDown,
    accent: "#ffc765",
    Preview: SortPreview,
  },
  {
    href: "/searching",
    title: "Searching",
    text: "See how each search narrows down to the value you are looking for.",
    icon: Search,
    accent: "#9fb1e8",
    Preview: SearchPreview,
  },
  {
    href: "/pathfinding",
    title: "Pathfinding",
    text: "Draw walls on a grid and watch an algorithm find the way from start to finish.",
    icon: Route,
    accent: "#7ee0bd",
    Preview: PathPreview,
  },
]

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#2f4478] via-[#3d4a8a] to-[#51448c] text-[#f4f7fb]">
      {/* Soft background glows */}
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#9fb1e8]/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-[#7ee0bd]/15 blur-3xl"
        aria-hidden="true"
      />

      <main className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <h1
            className={`${classic.className} text-5xl font-semibold leading-[1.05] tracking-tight text-[#f4f7fb] md:text-7xl`}
          >
            Algorithm Visualizer
          </h1>
          <div className="mx-auto mt-6 h-px w-24 bg-white/40" aria-hidden="true" />
          <p
            className={`${classic.className} mx-auto mt-6 max-w-xl text-xl italic leading-relaxed text-[#dbe5f1] md:text-2xl`}
          >
            Pick an algorithm and watch it run one step at a time.
          </p>
        </div>

        {/* Tool cards */}
        <div className="mt-14 grid gap-6 md:mt-16 md:grid-cols-3">
          {TOOLS.map(({ href, title, text, icon: Icon, accent, Preview }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-3xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-md transition duration-200 hover:-translate-y-1 hover:border-white/40 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffc765]"
            >
              <div className="rounded-2xl bg-[#1d3350]/40 p-4 ring-1 ring-white/10">
                <Preview />
              </div>

              <div className="mt-6 flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-[#1d3350]"
                  style={{ backgroundColor: accent }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="text-2xl font-semibold">{title}</h2>
              </div>

              <p className="mt-3 leading-relaxed text-[#dbe5f1]">{text}</p>

              <span
                className="mt-6 inline-flex w-fit items-center rounded-full px-4 py-1.5 text-sm font-semibold text-[#1d3350] transition-transform group-hover:scale-105"
                style={{ backgroundColor: accent }}
              >
                Open {title}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}