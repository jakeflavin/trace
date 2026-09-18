import type { GlyphSource } from '@/lib/glyphs'
import type { Page } from '@/lib/layout'
import { paperSize } from '@/lib/paper'
import type { Sheet } from '@/lib/sheet'
import { useFit } from '@/hooks/useFit'
import { SheetPage } from '@/components/Sheet/SheetPage'
import { Caption, Frame, More, Scaled, Sheet as SheetBox, Strip } from './Preview.styled'

/** Past this the preview shows a note instead of more paper; the printer still gets them all. */
const SHOWN = 24

export interface PreviewProps {
  sheet: Sheet
  pages: Page[]
  glyphs: GlyphSource | null
  /** Fit the page's height too, for a box of fixed height; otherwise its width alone. */
  fitHeight: boolean
}

/**
 * Every page, laid out at printed size and scaled to the box it is shown in.
 *
 * On a wide screen the pages stack, each as wide as the column. On a phone the box is a
 * short strip that stays put while the form scrolls beneath it, and the pages ride side
 * by side inside it.
 */
export function Preview({ sheet, pages, glyphs, fitHeight }: PreviewProps) {
  const size = paperSize(sheet.paper)
  const { ref, scale } = useFit(size.width, fitHeight ? size.height : Number.POSITIVE_INFINITY)
  const hidden = pages.length - SHOWN

  return (
    <Frame ref={ref} aria-label="Preview">
      <Strip>
        {pages.map((page, index) => (
          <SheetBox key={index} $screenOnly={index >= SHOWN}>
            <Scaled $scale={scale} $width={size.width} $height={size.height}>
              <SheetPage page={page} sheet={sheet} glyphs={glyphs} index={index} />
            </Scaled>
            {pages.length > 1 && (
              <Caption>
                {index + 1} of {pages.length}
              </Caption>
            )}
          </SheetBox>
        ))}
        {hidden > 0 && (
          <More role="status">
            {hidden === 1 ? 'One more page prints' : `${hidden} more pages print`}, past the
            preview.
          </More>
        )}
      </Strip>
    </Frame>
  )
}
