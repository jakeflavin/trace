import type { CSSProperties } from 'react'
import { findFont } from '@/lib/fonts'
import type { GlyphSource } from '@/lib/glyphs'
import type { Ruler } from '@/lib/metrics'
import { palette } from '@/lib/palette'
import { STROKES, type Sheet, type Stroke } from '@/lib/sheet'
import { Word } from '@/components/Sheet/Word'
import { StyleCard, StyleGrid } from './Editor.styled'

const LABELS: Record<Stroke, string> = {
  dotted: 'Dotted',
  dashed: 'Dashed',
  grey: 'Grey',
  hollow: 'Hollow',
}

/** The sample's top line is this far above its baseline; the box is sized around it. */
const CAP = 34
const WIDTH = 132
const HEIGHT = 66
const BASE = 50

export interface StylePickerProps {
  sheet: Sheet
  ruler: Ruler | null
  glyphs: GlyphSource | null
  onChange: (stroke: Stroke) => void
}

/** The four ways to draw a letter, each shown as it will print, in the chosen hand. */
export function StylePicker({ sheet, ruler, glyphs, onChange }: StylePickerProps) {
  const font = findFont(sheet.font)
  const metrics = ruler?.metrics ?? font.ratios
  const size = CAP / metrics.ascent
  const colors = palette(sheet.guides)
  const lines = [
    { y: BASE - CAP, color: colors.top, dash: undefined },
    { y: BASE - size * metrics.xHeight, color: colors.mid, dash: '5 4' },
    { y: BASE, color: colors.base, dash: undefined },
  ]

  return (
    <StyleGrid role="radiogroup" aria-label="Letter style">
      {STROKES.map((stroke) => (
        <StyleCard
          key={stroke}
          type="button"
          role="radio"
          aria-checked={sheet.stroke === stroke}
          aria-label={LABELS[stroke]}
          onClick={() => onChange(stroke)}
        >
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            aria-hidden="true"
            style={{ '--trace': colors.trace, '--fill': colors.fill } as CSSProperties}
          >
            <rect width={WIDTH} height={HEIGHT} fill={colors.paper} />
            {lines.map((line) => (
              <line
                key={line.y}
                x1={6}
                x2={WIDTH - 6}
                y1={line.y}
                y2={line.y}
                stroke={line.color}
                strokeWidth={1}
                strokeDasharray={line.dash}
              />
            ))}
            <Word
              run={{
                x: 14,
                y: BASE,
                text: 'Aa',
                size,
                style: stroke,
                spacing: font.tracking * CAP,
              }}
              font={font}
              glyphs={glyphs}
            />
          </svg>
          <b>{LABELS[stroke]}</b>
        </StyleCard>
      ))}
    </StyleGrid>
  )
}
