import { NextResponse } from "next/server"

// Mock analytics data - in a real app, this would connect to MongoDB
const analyticsData = {
  totalRuns: 0,
  algorithmUsage: {
    quicksort: 0,
    mergesort: 0,
    heapsort: 0,
    bubblesort: 0,
    selectionsort: 0,
    insertionsort: 0,
    countingsort: 0,
    radixsort: 0,
    linear: 0,
    binary: 0,
    bfs: 0,
    dfs: 0,
    astar: 0,
  },
  averageArraySize: 50,
  averageSpeed: 50,
}

export async function GET() {
  return NextResponse.json(analyticsData)
}

export async function POST(request) {
  const data = await request.json()

  // Update analytics
  analyticsData.totalRuns++
  if (analyticsData.algorithmUsage[data.algorithm] !== undefined) {
    analyticsData.algorithmUsage[data.algorithm]++
  }

  // Update averages (simplified calculation)
  if (data.arraySize) {
    analyticsData.averageArraySize = Math.round((analyticsData.averageArraySize + data.arraySize) / 2)
  }

  if (data.speed) {
    analyticsData.averageSpeed = Math.round((analyticsData.averageSpeed + data.speed) / 2)
  }

  return NextResponse.json({ success: true })
}
