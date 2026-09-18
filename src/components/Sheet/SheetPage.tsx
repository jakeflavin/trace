import type { CSSProperties } from 'react'
import { findFont } from '@/lib/fonts'
import type { GlyphSource } from '@/lib/glyphs'
import { type Line, type Page, TITLE_SIZE } from '@/lib/layout'
import { palette } from '@/lib/palette'
import { MARGIN } from '@/lib/paper'
import type { Sheet } from '@/lib/sheet'
import { Paper } from './SheetPage.styled'
import { Word } from './Word'

export interface SheetPageProps {
  page: Page
  sheet: Sheet
  /** Where traced letters get their spines; null draws outlines instead. */
  glyphs: GlyphSource | null
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

/**
 * One printed page, as an SVG at its paper size.
 *
 * Everything on it was placed by `lib/layout.ts`; this only draws. The page's colours are
 * its own custom properties, set here from the palette, so the same markup is right in
 * the preview, in the thumbnails and on paper whatever the editor's theme is.
 */
export function SheetPage({ page, sheet, glyphs, index, thumbnail = false }: SheetPageProps) {
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
            y={MARGIN + 32}
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
          <Word key={i} run={run} font={font} glyphs={glyphs} />
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
