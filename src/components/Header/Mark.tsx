import { Tile } from './Header.styled'

/** Three handwriting lines with a dotted letter on them: the same mark as the app icon. */
export function Mark() {
  return (
    <Tile viewBox="0 0 12 12" aria-hidden="true">
      <rect width="12" height="12" rx="2.6" fill="rgb(36 86 214)" />
      <line x1="2" y1="3.5" x2="10" y2="3.5" stroke="rgb(255 255 255 / 0.9)" strokeWidth="0.7" />
      <line
        x1="2"
        y1="6"
        x2="10"
        y2="6"
        stroke="rgb(255 255 255 / 0.6)"
        strokeWidth="0.6"
        strokeDasharray="0.9 0.7"
      />
      <line x1="2" y1="8.5" x2="10" y2="8.5" stroke="rgb(255 120 100)" strokeWidth="0.8" />
    </Tile>
  )
}
