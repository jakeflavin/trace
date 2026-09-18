/**
 * The spine of every letter, drawn once and kept.
 *
 * A glyph is drawn to a canvas in the sheet's font, thinned to its skeleton by
 * `lib/skeleton.ts`, and the strokes are kept in em units so any size is a scale. The
 * font's regular weight is used rather than its bold: the thinner the ink, the fewer
 * stubs the thinning grows where strokes meet, and the spine is the same either way.
 *
 * This is the one module that draws text to a canvas. Where there is none (jsdom) it
 * returns null, and the page falls back to drawing the outline.
 */
import type { Font } from './fonts'
import { type Stroke, skeletonize } from './skeleton'

export interface Glyph {
  /** How far the pen moves on, per unit of font size. */
  advance: number
  /** Polylines in em units, origin at the left of the glyph on the baseline, y down. */
  strokes: Stroke[]
}

export type GlyphSource = (ch: string) => Glyph | null

/** Big enough that the skeleton is smooth, small enough that a glyph takes milliseconds. */
const SIZE = 160
const PAD = 4
/** Anti-aliased edges below this are paper, not ink. */
const INK = 110

const cache = new Map<string, Glyph | null>()
let canvas: HTMLCanvasElement | null | undefined

function context(): CanvasRenderingContext2D | null {
  if (canvas === undefined) {
    canvas = typeof document === 'undefined' ? null : document.createElement('canvas')
  }
  const ctx = canvas?.getContext('2d', { willReadFrequently: true }) ?? null
  return ctx && typeof ctx.getImageData === 'function' ? ctx : null
}

function cssFont(font: Font): string {
  return `${font.weight} ${SIZE}px "${font.family}"`
}

export function glyphFor(font: Font, ch: string): Glyph | null {
  const id = `${font.id}/${ch}`
  const kept = cache.get(id)
  if (kept !== undefined) return kept
  const ctx = context()
  if (!ctx || !canvas) return null
  ctx.font = cssFont(font)
  const metrics = ctx.measureText(ch)
  const advance = metrics.width / SIZE
  if (!ch.trim()) {
    const glyph = { advance, strokes: [] }
    cache.set(id, glyph)
    return glyph
  }
  const left = Math.max(0, Math.ceil(metrics.actualBoundingBoxLeft)) + PAD
  const right = Math.max(1, Math.ceil(metrics.actualBoundingBoxRight)) + PAD
  const ascent = Math.max(1, Math.ceil(metrics.actualBoundingBoxAscent)) + PAD
  const descent = Math.max(0, Math.ceil(metrics.actualBoundingBoxDescent)) + PAD
  const width = left + right
  const height = ascent + descent
  // Resizing resets the context, so the font is set again afterwards.
  canvas.width = width
  canvas.height = height
  ctx.font = cssFont(font)
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#000'
  ctx.clearRect(0, 0, width, height)
  ctx.fillText(ch, left, ascent)
  const pixels = ctx.getImageData(0, 0, width, height).data
  const data = new Uint8Array(width * height)
  for (let i = 0; i < data.length; i += 1) data[i] = (pixels[i * 4 + 3] ?? 0) > INK ? 1 : 0
  const { strokes } = skeletonize({ width, height, data })
  const glyph: Glyph = {
    advance,
    strokes: strokes.map((stroke) =>
      stroke.map((p) => ({ x: (p.x + 0.5 - left) / SIZE, y: (p.y + 0.5 - ascent) / SIZE })),
    ),
  }
  cache.set(id, glyph)
  return glyph
}

/** A source bound to one font, or null where nothing can be drawn. */
export function glyphSource(font: Font): GlyphSource | null {
  return context() ? (ch) => glyphFor(font, ch) : null
}
