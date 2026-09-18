/**
 * Measures a font the way it will actually be drawn.
 *
 * A tracing sheet lives or dies on the letters touching the lines, and every face puts
 * its tall letters, small letters and tails somewhere different. Rather than carry a
 * table that drifts from the font files, the shape is read off a canvas once the font has
 * loaded: the ascent of the tall letters, the ascent of the small ones and the descent of
 * the tails, each as a fraction of the font size.
 *
 * This is the one module that talks to a canvas. It returns nothing where there is none
 * (jsdom), and the layout falls back to the font's declared ratios.
 */
import type { Font, FontMetrics } from './fonts'
import type { Measure } from './layout'

export interface Ruler {
  metrics: FontMetrics
  measure: Measure
}

const PROBE = 100
const TALL = 'bdhklB'
const SMALL = 'xvwzc'
const TAILS = 'gjpqy'

function context(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  return ctx && typeof ctx.measureText === 'function' ? ctx : null
}

function cssFont(font: Font, size: number): string {
  return `${font.weight} ${size}px "${font.family}"`
}

/** A ruler for `font`, or null where nothing can be measured. */
export function measureFont(font: Font): Ruler | null {
  const ctx = context()
  if (!ctx) return null
  ctx.font = cssFont(font, PROBE)
  ctx.textBaseline = 'alphabetic'
  const box = (text: string) => ctx.measureText(text)
  const tall = box(TALL).actualBoundingBoxAscent
  const small = box(SMALL).actualBoundingBoxAscent
  const tails = box(TAILS).actualBoundingBoxDescent
  // A browser without the bounding-box metrics reports zero; that is not a font shape.
  if (!(tall > 0 && small > 0 && tails > 0)) return null
  const metrics: FontMetrics = {
    ascent: tall / PROBE,
    xHeight: small / PROBE,
    descent: tails / PROBE,
  }
  const measure: Measure = (text, size) => {
    ctx.font = cssFont(font, size)
    return ctx.measureText(text).width
  }
  return { metrics, measure }
}

/** Resolves once the browser has the font, so a measurement is of it and not a fallback. */
export async function loadFont(font: Font): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return
  try {
    await document.fonts.load(cssFont(font, 16))
  } catch {
    // The fallback face is drawn instead; the sheet is still usable.
  }
}
