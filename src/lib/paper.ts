/**
 * A page is laid out at its printed size, in CSS pixels at 96 to the inch, and scaled
 * down to be looked at. The two sizes the world prints on, both portrait: a handwriting
 * line is wide enough on either, and a landscape sheet is a thing to turn.
 */
export type Paper = 'letter' | 'a4'

export interface PaperSize {
  width: number
  height: number
  /** The CSS `@page size` keyword, so print matches the preview. */
  css: string
}

const SIZES: Record<Paper, PaperSize> = {
  letter: { width: 816, height: 1056, css: 'letter portrait' },
  a4: { width: 794, height: 1123, css: 'A4 portrait' },
}

export function paperSize(paper: Paper): PaperSize {
  return SIZES[paper]
}

export function isPaper(value: unknown): value is Paper {
  return value === 'letter' || value === 'a4'
}

/** Half an inch all round: inside what any home printer can reach. */
export const MARGIN = 48
