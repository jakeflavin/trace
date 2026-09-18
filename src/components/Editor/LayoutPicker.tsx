import { layoutSheet } from '@/lib/layout'
import type { Ruler } from '@/lib/metrics'
import { LAYOUTS, type LayoutId, type Sheet } from '@/lib/sheet'
import { SheetPage } from '@/components/Sheet/SheetPage'
import { LayoutCard, LayoutGrid, Thumb } from './Editor.styled'

export interface LayoutPickerProps {
  sheet: Sheet
  ruler: Ruler | null
  onChange: (layout: LayoutId) => void
}

/** The eleven layouts, each shown as the first page it would make of these very words. */
export function LayoutPicker({ sheet, ruler, onChange }: LayoutPickerProps) {
  // Two words are enough to tell a list from a name sheet; a hundred would be a hundred pages.
  const sample = { ...sheet, words: sheet.words.slice(0, 3), nameLine: false }

  return (
    <LayoutGrid role="radiogroup" aria-label="Layout">
      {LAYOUTS.map((layout) => {
        const page = layoutSheet({
          sheet: { ...sample, layout: layout.id },
          metrics: ruler?.metrics,
          measure: ruler?.measure,
        })[0]
        return (
          <LayoutCard
            key={layout.id}
            type="button"
            role="radio"
            aria-checked={sheet.layout === layout.id}
            aria-label={layout.label}
            title={layout.note}
            onClick={() => onChange(layout.id)}
          >
            <Thumb>{page && <SheetPage page={page} sheet={sample} index={0} thumbnail />}</Thumb>
            <b>{layout.label}</b>
          </LayoutCard>
        )
      })}
    </LayoutGrid>
  )
}
