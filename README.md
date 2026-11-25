# Algorithm Visualizer

An interactive web app to see how classic algorithms work, step by step. Built with Next.js and a clean dark slate theme.

## Features

### Sorting Visualizer
Watch bars get sorted with colour-coded comparisons.
- Bubble Sort
- Selection Sort
- Insertion Sort
- Quick Sort
- Merge Sort
- Heap Sort
- Counting Sort
- Radix Sort

Includes time and space complexity info for each algorithm.

### Search Visualizer
- Linear Search
- Binary Search (works on a sorted list)

### Pathfinding Visualizer
- Breadth-First Search (BFS)
- Depth-First Search (DFS)

Click cells on the grid to add or remove walls.

### Controls
- Adjustable array size / cell size
- Adjustable animation speed
- Generate a new array or reset the grid at any time

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)

## Getting Started

### Prerequisites
- Node.js 18 or later
- npm (or yarn / pnpm)

### Installation

```bash

# install dependencies
npm install

# start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── page.jsx            # Home page
├── sorting/page.jsx    # Sorting visualizer
├── searching/page.jsx  # Search visualizer
└── pathfinding/page.jsx # Pathfinding visualizer
```

## Colour Legend

| Colour | Meaning |
| ------ | ------- |
| Lavender | Unsorted / unsearched |
| Amber | Currently comparing / checking |
| Mint green | Sorted / found / final path |

## Roadmap

- [ ] A* Search for the pathfinding visualizer
- [ ] Draggable start and end nodes
- [ ] More sorting and graph algorithms

## License

This project is open source and available under the [MIT License](LICENSE).
