/**
 * Writes the mark: `public/favicon.svg` and the home-screen PNGs.
 *
 * iOS ignores an SVG apple-touch-icon, so the PNGs have to exist as files. They are
 * generated here and committed rather than built, which keeps an image library out of the
 * dependency list for four small assets.
 *
 * The mark is a scrap of handwriting paper: a top line, a dashed midline and a red
 * baseline on a blue tile. It reads at 16 pixels, which a dotted letter does not.
 */
import { writeFileSync } from 'node:fs'
import { writeIcons } from './icon-png.mjs'

const OUT = new URL('../public/', import.meta.url)

const GROUND = [36, 86, 214]
const WHITE = [255, 255, 255]
const RED = [255, 120, 100]

const SPAN = 12
const X1 = 2
const X2 = 10
/** y, half-thickness, colour, dash length (0 for solid). */
const LINES = [
  { y: 3.5, t: 0.35, rgb: WHITE, dash: 0 },
  { y: 6, t: 0.3, rgb: WHITE, dash: 0.9, gap: 0.7 },
  { y: 8.5, t: 0.4, rgb: RED, dash: 0 },
]

const rgb = (channels) => `rgb(${channels.join(' ')})`

const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SPAN} ${SPAN}">`,
  '  <!-- Handwriting lines on a blue tile. -->',
  `  <rect width="${SPAN}" height="${SPAN}" rx="2.6" fill="${rgb(GROUND)}"/>`,
  ...LINES.map(
    (line) =>
      `  <line x1="${X1}" y1="${line.y}" x2="${X2}" y2="${line.y}" stroke="${rgb(line.rgb)}" stroke-width="${line.t * 2}"${line.dash ? ` stroke-dasharray="${line.dash} ${line.gap}"` : ''}/>`,
  ),
  '</svg>',
  '',
].join('\n')

writeFileSync(new URL('favicon.svg', OUT), svg)
console.log('wrote favicon.svg')

/** Which line, if any, covers a point; the same geometry the SVG draws. */
function colourAt(x, y) {
  if (x < X1 || x > X2) return GROUND
  for (const line of LINES) {
    if (Math.abs(y - line.y) > line.t) continue
    if (line.dash && (x - X1) % (line.dash + line.gap) > line.dash) continue
    return line.rgb
  }
  return GROUND
}

function render(size) {
  const pixels = new Array(size * size)
  const unit = size / SPAN
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      pixels[y * size + x] = colourAt((x + 0.5) / unit, (y + 0.5) / unit)
    }
  }
  return pixels
}

writeIcons(OUT, [180, 192, 512], render)
