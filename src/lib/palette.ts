/**
 * The page's own colours. Paper is white whatever the editor's theme is, so none of these
 * come from the editor's tokens; `SheetPage` writes them onto the page as custom
 * properties and every mark on it reads those.
 */
import type { GuideColor } from './sheet'

export interface Palette {
  paper: string
  /** Solid text: the heading and the model word. */
  ink: string
  /** Dotted and hollow outlines. Dark enough to follow, light enough to write over. */
  trace: string
  /** A filled letter to write over. */
  fill: string
  top: string
  mid: string
  base: string
  desc: string
  /** Boxes and the cut lines between cards. */
  frame: string
}

const BASE = {
  paper: '#ffffff',
  ink: '#1c1c1e',
  trace: '#8a8a90',
  fill: '#cfcfd3',
  frame: '#b8b8bd',
}

const PALETTES: Record<GuideColor, Palette> = {
  classic: { ...BASE, top: '#3b6fd6', mid: '#3b6fd6', base: '#d6453b', desc: '#3b6fd6' },
  grey: { ...BASE, top: '#9a9aa0', mid: '#9a9aa0', base: '#6b6b70', desc: '#b5b5ba' },
  black: { ...BASE, top: '#1c1c1e', mid: '#1c1c1e', base: '#1c1c1e', desc: '#6b6b70' },
}

export function palette(guides: GuideColor): Palette {
  return PALETTES[guides]
}
