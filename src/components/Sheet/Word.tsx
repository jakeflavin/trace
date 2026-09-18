import type { CSSProperties } from 'react'
import type { Font } from '@/lib/fonts'
import type { GlyphSource } from '@/lib/glyphs'
import type { Run } from '@/lib/layout'

export interface WordProps {
  run: Run
  font: Font
  /** Where the spines come from; null draws an outline instead. */
  glyphs: GlyphSource | null
}

/** A solid letter, a grey one, or an outline: the font's own shape, painted. */
function paintText(run: Run): CSSProperties {
  switch (run.style) {
    case 'grey':
      return { fill: 'var(--fill)' }
    case 'hollow':
      return {
        fill: 'none',
        stroke: 'var(--trace)',
        strokeWidth: Math.max(1.2, run.size * 0.026),
        strokeLinejoin: 'round',
      }
    case 'dotted':
    case 'dashed':
      // Only reached without a canvas to find the spine; the outline is the next best.
      return {
        fill: 'none',
        stroke: 'var(--trace)',
        strokeWidth: Math.max(1.1, run.size * 0.02),
        strokeLinecap: 'round',
        strokeDasharray: `${(run.size * 0.045).toFixed(1)} ${(run.size * 0.05).toFixed(1)}`,
      }
    default:
      return { fill: 'var(--ink)' }
  }
}

const round = (n: number) => n.toFixed(1)

/**
 * One run of text on the page.
 *
 * A letter to be traced is dots or dashes along the spine of each stroke, the way a
 * tracing font draws them, so a child follows one line rather than the two edges of an
 * outline. Everything else is the glyph itself.
 */
export function Word({ run, font, glyphs }: WordProps) {
  const spine = (run.style === 'dotted' || run.style === 'dashed') && glyphs
  if (spine) {
    const found = [...run.text].map((ch) => glyphs(ch))
    if (found.every((glyph) => glyph !== null)) {
      const w = Math.min(9, Math.max(1.6, run.size * 0.068))
      const paths: string[] = []
      let pen = run.x
      for (const glyph of found) {
        for (const stroke of glyph.strokes) {
          paths.push(
            stroke
              .map((p, i) => {
                const x = round(pen + p.x * run.size)
                const y = round(run.y + p.y * run.size)
                return `${i === 0 ? 'M' : 'L'}${x} ${y}`
              })
              .join(''),
          )
        }
        pen += glyph.advance * run.size + run.spacing
      }
      const dash =
        run.style === 'dotted' ? `0.01 ${round(w * 1.55)}` : `${round(w * 2.2)} ${round(w * 1.4)}`
      return (
        <path
          d={paths.join('')}
          fill="none"
          stroke="var(--trace)"
          strokeWidth={w}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={dash}
        />
      )
    }
  }

  return (
    <text
      x={run.x}
      y={run.y}
      fontFamily={font.family}
      fontWeight={run.size < 20 ? font.bold : font.weight}
      fontSize={run.size}
      letterSpacing={run.spacing || undefined}
      style={{ whiteSpace: 'pre', ...paintText(run) }}
    >
      {run.text}
    </text>
  )
}
