import type { CSSProperties } from 'react'
import { findFont } from '@/lib/fonts'
import { type Line, type Page, type Run, TITLE_SIZE } from '@/lib/layout'
import { palette } from '@/lib/palette'
import { MARGIN } from '@/lib/paper'
import type { Sheet } from '@/lib/sheet'
import { Paper } from './SheetPage.styled'

export interface SheetPageProps {
  page: Page
  sheet: Sheet
  /** Which page this is, for the label; pages are otherwise identical regions. */
  index: number
  /** A thumbnail is a picture of a page, not a page: no label, no fixed size. */
  thumbnail?: boolean
}

const LINE_STROKE: Record<Line['kind'], { width: number; dash?: string; token: string }> = {
  top: { width: 1.4, token: 'top' },
  mid: { width: 1.2, dash: '9 7', token: 'mid' },
  base: { width: 1.6, token: 'base' },
  desc: { width: 1, token: 'desc' },
  blank: { width: 1.2, token: 'frame' },
}

/** How each kind of run is painted. Outlines scale with the letters; a fill does not care. */
function paint(run: Run): CSSProperties {
  const outline = Math.min(2.4, Math.max(1.1, run.size * 0.02))
  switch (run.style) {
    case 'ink':
      return { fill: 'var(--ink)' }
    case 'grey':
      return { fill: 'var(--fill)' }
    case 'faint':
      return { fill: 'var(--faint)' }
    case 'hollow':
      return { fill: 'none', stroke: 'var(--trace)', strokeWidth: outline * 1.3 }
    case 'dotted':
      return {
        fill: 'none',
        stroke: 'var(--trace)',
        strokeWidth: outline,
        strokeLinecap: 'round',
        strokeDasharray: `${(run.size * 0.045).toFixed(1)} ${(run.size * 0.05).toFixed(1)}`,
      }
  }
}

/**
 * One printed page, as an SVG at its paper size.
 *
 * Everything on it was placed by `lib/layout.ts`; this only draws. The page's colours are
 * its own custom properties, set here from the palette, so the same markup is right in
 * the preview, in the thumbnails and on paper whatever the editor's theme is.
 */
export function SheetPage({ page, sheet, index, thumbnail = false }: SheetPageProps) {
  const font = findFont(sheet.font)
  const colors = palette(sheet.guides)
  const vars = Object.fromEntries(
    Object.entries(colors).map(([key, value]) => [`--${key}`, value]),
  ) as CSSProperties

  return (
    <Paper
      as={thumbnail ? 'div' : 'section'}
      aria-label={thumbnail ? undefined : `Page ${index + 1}`}
      aria-hidden={thumbnail || undefined}
      $width={page.width}
      $height={page.height}
      $thumbnail={thumbnail}
      style={vars}
    >
      <svg
        viewBox={`0 0 ${page.width} ${page.height}`}
        width={thumbnail ? undefined : page.width}
        height={thumbnail ? undefined : page.height}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={page.width} height={page.height} fill="var(--paper)" />

        {page.title && (
          <text
            x={MARGIN}
            y={MARGIN + 30}
            fontFamily={font.family}
            fontWeight={font.bold}
            fontSize={TITLE_SIZE}
            fill="var(--ink)"
          >
            {page.title}
          </text>
        )}

        {page.boxes.map((box, i) => (
          <rect
            key={i}
            x={box.x}
            y={box.y}
            width={box.w}
            height={box.h}
            rx={box.kind === 'card' ? 12 : 3}
            fill="none"
            stroke="var(--frame)"
            strokeWidth={box.kind === 'card' ? 1.2 : 1.1}
            strokeDasharray={box.kind === 'card' ? '7 6' : undefined}
          />
        ))}

        {page.lines.map((line, i) => {
          const spec = LINE_STROKE[line.kind]
          return (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={`var(--${spec.token})`}
              strokeWidth={spec.width}
              strokeDasharray={spec.dash}
              strokeLinecap="round"
            />
          )
        })}

        {page.runs.map((run, i) => (
          <g key={i}>
            {run.dot && <circle cx={run.dot.x} cy={run.dot.y} r={run.dot.r} fill="var(--start)" />}
            <text
              x={run.x}
              y={run.y}
              fontFamily={font.family}
              fontWeight={run.size < 20 ? font.bold : font.weight}
              fontSize={run.size}
              letterSpacing={run.spacing || undefined}
              style={{ whiteSpace: 'pre', ...paint(run) }}
            >
              {run.text}
            </text>
          </g>
        ))}

        {!thumbnail && (
          <text
            x={page.width - MARGIN}
            y={page.height - 22}
            textAnchor="end"
            fontSize={9}
            fill="var(--frame)"
            fontFamily="inherit"
          >
            portfolio-4b9fe.web.app/trace
          </text>
        )}
      </svg>
    </Paper>
  )
}
