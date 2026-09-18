import styled from 'styled-components'

/*
 * A page reads only its own tokens (--paper, --ink, --trace, --fill, --faint, --top,
 * --mid, --base, --desc, --start, --frame), which `SheetPage` writes onto it from the
 * palette. Nothing here reads the editor's tokens: the page has to look the same in the
 * preview and on paper, and the editor's dark mode is none of its business.
 */
export const Paper = styled.section<{ $width: number; $height: number; $thumbnail: boolean }>`
  position: relative;
  width: ${({ $thumbnail, $width }) => ($thumbnail ? '100%' : `${$width}px`)};
  height: ${({ $thumbnail, $height }) => ($thumbnail ? 'auto' : `${$height}px`)};
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-sans);
  overflow: hidden;
  /* The guides are the worksheet; a printer that drops colour still has to draw them. */
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  @media print {
    /* Fill whatever paper the printer has; the page was laid out for it. */
    width: 100vw;
    height: 100vh;
    break-after: page;
    break-inside: avoid;

    &:last-child {
      break-after: auto;
    }
  }
`
