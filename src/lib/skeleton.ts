/**
 * Finds the line down the middle of a shape.
 *
 * A tracing letter is dots along the spine of each stroke, not around its edge. A font
 * only knows its outlines, so each glyph is drawn to a bitmap and thinned to a
 * one-pixel skeleton (Zhang–Suen), the skeleton is walked into polylines, the stubs the
 * thinning leaves at corners are pruned, and what is left is simplified and smoothed
 * into strokes a pen could follow. Pure functions over a bitmap; the canvas work that
 * feeds them lives in `lib/glyphs.ts`.
 */

export interface Point {
  x: number
  y: number
}

/** An open or closed polyline; closed when its last point repeats its first. */
export type Stroke = Point[]

export interface Bitmap {
  width: number
  height: number
  /** Row-major, one byte a pixel, 1 for ink. */
  data: Uint8Array
}

export interface Skeleton {
  strokes: Stroke[]
  /** The average width of the ink, in pixels: ink area over skeleton length. */
  stem: number
}

/* N, NE, E, SE, S, SW, W, NW: the order Zhang–Suen counts transitions in. */
const RING: readonly (readonly [number, number])[] = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
]

function at(bitmap: Bitmap, x: number, y: number): number {
  if (x < 0 || y < 0 || x >= bitmap.width || y >= bitmap.height) return 0
  return bitmap.data[y * bitmap.width + x] ?? 0
}

function ring(bitmap: Bitmap, x: number, y: number): number[] {
  return RING.map(([dx, dy]) => at(bitmap, x + dx, y + dy))
}

/** Zhang–Suen thinning: peels the shape to its one-pixel skeleton. */
export function thin(source: Bitmap): Bitmap {
  const { width, height } = source
  const bitmap: Bitmap = { width, height, data: Uint8Array.from(source.data) }
  const marks: number[] = []
  for (let pass = 0; ; pass = 1 - pass) {
    marks.length = 0
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        if (!at(bitmap, x, y)) continue
        const p = ring(bitmap, x, y)
        const [p2, p3, p4, p5, p6, p7, p8, p9] = p as [
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
        ]
        const b = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9
        if (b < 2 || b > 6) continue
        let a = 0
        for (let i = 0; i < 8; i += 1) if (!p[i] && p[(i + 1) % 8]) a += 1
        if (a !== 1) continue
        const ok =
          pass === 0
            ? p2 * p4 * p6 === 0 && p4 * p6 * p8 === 0
            : p2 * p4 * p8 === 0 && p2 * p6 * p8 === 0
        if (ok) marks.push(y * width + x)
      }
    }
    for (const index of marks) bitmap.data[index] = 0
    // Two passes with nothing to peel in either is the fixed point.
    if (marks.length === 0 && pass === 1) break
    if (marks.length === 0 && pass === 0) {
      // Still check the second sub-pass before stopping.
      let more = false
      for (let y = 1; y < height - 1 && !more; y += 1) {
        for (let x = 1; x < width - 1; x += 1) {
          if (!at(bitmap, x, y)) continue
          const p = ring(bitmap, x, y)
          const b = p.reduce((sum, v) => sum + v, 0)
          if (b < 2 || b > 6) continue
          let a = 0
          for (let i = 0; i < 8; i += 1) if (!p[i] && p[(i + 1) % 8]) a += 1
          if (a !== 1) continue
          if (p[0]! * p[2]! * p[6]! === 0 && p[0]! * p[4]! * p[6]! === 0) {
            more = true
            break
          }
        }
      }
      if (!more) break
    }
  }
  unstair(bitmap)
  return bitmap
}

/**
 * Zhang–Suen leaves L-shaped corners: a pixel whose north and east neighbours are both
 * set while nothing lies to its south or west. The two neighbours already touch
 * diagonally, so the corner pixel is redundant, and left in it reads as a junction.
 * Removed one at a time, so the second pixel of a pair sees the first one gone.
 */
function unstair(bitmap: Bitmap) {
  const { width, height } = bitmap
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!at(bitmap, x, y)) continue
      const n = at(bitmap, x, y - 1)
      const e = at(bitmap, x + 1, y)
      const s = at(bitmap, x, y + 1)
      const w = at(bitmap, x - 1, y)
      const ne = at(bitmap, x + 1, y - 1)
      const se = at(bitmap, x + 1, y + 1)
      const sw = at(bitmap, x - 1, y + 1)
      const nw = at(bitmap, x - 1, y - 1)
      const redundant =
        (n && e && !s && !w && !sw) ||
        (e && s && !w && !n && !nw) ||
        (s && w && !n && !e && !ne) ||
        (w && n && !e && !s && !se)
      if (redundant) bitmap.data[y * width + x] = 0
    }
  }
}

function neighbours(bitmap: Bitmap, x: number, y: number): Point[] {
  const out: Point[] = []
  // Straight neighbours first, so a walk does not cut a corner it will visit anyway.
  for (const i of [0, 2, 4, 6, 1, 3, 5, 7]) {
    const [dx, dy] = RING[i]!
    if (at(bitmap, x + dx, y + dy)) out.push({ x: x + dx, y: y + dy })
  }
  return out
}

function length(stroke: Stroke): number {
  let total = 0
  for (let i = 1; i < stroke.length; i += 1) {
    const a = stroke[i - 1]!
    const b = stroke[i]!
    total += Math.hypot(b.x - a.x, b.y - a.y)
  }
  return total
}

const key = (p: Point) => p.y * 65536 + p.x

/**
 * Walks a skeleton into polylines. Pixels with one neighbour are ends, three or more
 * are junctions; a walk runs from one to the next. Loops with no ends (an o) are picked
 * up afterwards. `prune` is the longest stub, in pixels, that is a thinning artefact
 * rather than a stroke.
 */
export function trace(skeleton: Bitmap, prune: number): Stroke[] {
  const { width, height } = skeleton
  const degree = new Uint8Array(width * height)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (at(skeleton, x, y)) degree[y * width + x] = neighbours(skeleton, x, y).length
    }
  }
  const isNode = (p: Point) => degree[p.y * width + p.x] !== 2
  const visited = new Uint8Array(width * height)
  const mark = (p: Point) => {
    visited[p.y * width + p.x] = 1
  }
  const seen = (p: Point) => visited[p.y * width + p.x] === 1
  const usedEdges = new Set<string>()
  const edge = (a: Point, b: Point) =>
    key(a) < key(b) ? `${key(a)}:${key(b)}` : `${key(b)}:${key(a)}`

  const segments: Stroke[] = []

  const walk = (start: Point, first: Point) => {
    const stroke: Stroke = [start, first]
    usedEdges.add(edge(start, first))
    if (isNode(first)) return stroke
    mark(first)
    let prev = start
    let cur = first
    for (;;) {
      const options = neighbours(skeleton, cur.x, cur.y).filter(
        (p) => !(p.x === prev.x && p.y === prev.y),
      )
      const plain = options.find((p) => !isNode(p) && !seen(p))
      const node = options.find((p) => isNode(p) && !usedEdges.has(edge(cur, p)))
      const next = plain ?? node
      if (!next) return stroke
      usedEdges.add(edge(cur, next))
      stroke.push(next)
      if (isNode(next)) return stroke
      mark(next)
      prev = cur
      cur = next
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const p = { x, y }
      if (!at(skeleton, x, y) || !isNode(p)) continue
      for (const q of neighbours(skeleton, x, y)) {
        if (usedEdges.has(edge(p, q))) continue
        if (!isNode(q) && seen(q)) continue
        segments.push(walk(p, q))
      }
    }
  }

  // Closed loops: every pixel has two neighbours, so no walk above started on them.
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const p = { x, y }
      if (!at(skeleton, x, y) || seen(p) || isNode(p)) continue
      mark(p)
      const first = neighbours(skeleton, x, y)[0]
      if (!first) continue
      const stroke = walk(p, first)
      const last = stroke[stroke.length - 1]!
      if (neighbours(skeleton, last.x, last.y).some((q) => q.x === x && q.y === y)) stroke.push(p)
      segments.push(stroke)
    }
  }

  return merge(
    pruneStubs(segments, prune, (p) => degree[p.y * width + p.x] ?? 0),
    (p) => (degree[p.y * width + p.x] ?? 0) >= 3,
  )
}

/** Drops the stubs thinning grows at corners, and the crumbs between adjacent junctions. */
function pruneStubs(segments: Stroke[], prune: number, degreeOf: (p: Point) => number) {
  return segments.filter((stroke) => {
    const a = stroke[0]!
    const b = stroke[stroke.length - 1]!
    const ends = [degreeOf(a), degreeOf(b)]
    const size = length(stroke)
    if (ends.every((d) => d >= 3) && size < 2.5) return false
    if (ends.some((d) => d >= 3) && ends.some((d) => d <= 1) && size < prune) return false
    return true
  })
}

/** Joins the two strokes left at a junction the pruning has reduced to a bend. */
function merge(segments: Stroke[], isJunction: (p: Point) => boolean): Stroke[] {
  const strokes = segments.map((s) => [...s])
  for (;;) {
    const touching = new Map<number, number[]>()
    strokes.forEach((stroke, i) => {
      const a = stroke[0]!
      const b = stroke[stroke.length - 1]!
      if (a.x === b.x && a.y === b.y) return
      for (const p of [a, b]) {
        if (!isJunction(p)) continue
        const list = touching.get(key(p)) ?? []
        list.push(i)
        touching.set(key(p), list)
      }
    })
    const pair = [...touching.entries()].find(
      ([, list]) => list.length === 2 && list[0] !== list[1],
    )
    if (!pair) return strokes
    const [k, [i, j]] = pair as [number, [number, number]]
    const first = strokes[i]!
    const second = strokes[j]!
    const oriented = (s: Stroke, endAtKey: boolean) =>
      (key(s[s.length - 1]!) === k) === endAtKey ? s : [...s].reverse()
    const joined = [...oriented(first, true), ...oriented(second, false).slice(1)]
    strokes.splice(Math.max(i, j), 1)
    strokes.splice(Math.min(i, j), 1, joined)
  }
}

/** Ramer–Douglas–Peucker: the fewest points that stay within `epsilon` of the line. */
export function simplify(stroke: Stroke, epsilon: number): Stroke {
  if (stroke.length < 3) return stroke
  const first = stroke[0]!
  const last = stroke[stroke.length - 1]!
  let far = 0
  let index = 0
  for (let i = 1; i < stroke.length - 1; i += 1) {
    const p = stroke[i]!
    const dx = last.x - first.x
    const dy = last.y - first.y
    const denominator = Math.hypot(dx, dy)
    const distance =
      denominator === 0
        ? Math.hypot(p.x - first.x, p.y - first.y)
        : Math.abs(dy * p.x - dx * p.y + last.x * first.y - last.y * first.x) / denominator
    if (distance > far) {
      far = distance
      index = i
    }
  }
  if (far <= epsilon) return [first, last]
  return [
    ...simplify(stroke.slice(0, index + 1), epsilon).slice(0, -1),
    ...simplify(stroke.slice(index), epsilon),
  ]
}

/** Chaikin's corner cutting; a closed stroke stays closed and an open one keeps its ends. */
export function smooth(stroke: Stroke, iterations: number): Stroke {
  let points = stroke
  for (let n = 0; n < iterations; n += 1) {
    if (points.length < 3) return points
    const first = points[0]!
    const last = points[points.length - 1]!
    const closed = first.x === last.x && first.y === last.y
    const out: Stroke = closed ? [] : [first]
    for (let i = 0; i < points.length - 1; i += 1) {
      const a = points[i]!
      const b = points[i + 1]!
      out.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 })
      out.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 })
    }
    if (closed) out.push(out[0]!)
    else out.push(last)
    points = out
  }
  return points
}

/** The whole pipeline: bitmap in, strokes out. */
export function skeletonize(bitmap: Bitmap): Skeleton {
  const skeleton = thin(bitmap)
  let ink = 0
  let bone = 0
  for (let i = 0; i < bitmap.data.length; i += 1) {
    if (bitmap.data[i]) ink += 1
    if (skeleton.data[i]) bone += 1
  }
  const stem = bone > 0 ? ink / bone : 0
  const strokes = trace(skeleton, stem * 0.9)
    .map((stroke) => smooth(simplify(stroke, 1), 2))
    .filter((stroke) => stroke.length >= 2)
  return { strokes, stem }
}
