import styled from 'styled-components'

export const Frame = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;

  @media print {
    height: auto;
  }
`

export const Strip = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 24px;

  @media (max-width: 899px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;
    height: 100%;
    padding: 10px 12px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  @media print {
    display: block;
    padding: 0;
  }
`

/*
 * A page at printed size, shrunk to fit. The wrapper takes the scaled footprint so the
 * layout around it is honest about the space; the page inside is untouched, which is
 * what the printer needs.
 */
export const Scaled = styled.div<{
  $scale: number
  $width: number
  $height: number
  $screenOnly: boolean
}>`
  flex: none;
  display: ${({ $screenOnly }) => ($screenOnly ? 'none' : 'block')};
  width: ${({ $scale, $width }) => Math.round($width * $scale)}px;
  height: ${({ $scale, $height }) => Math.round($height * $scale)}px;
  scroll-snap-align: center;
  border-radius: 4px;
  box-shadow: var(--shadow);
  overflow: hidden;
  /* Forty pages of paper is a lot of text nodes; the ones off screen can wait. */
  content-visibility: auto;
  contain-intrinsic-size: ${({ $scale, $width, $height }) =>
    `${Math.round($width * $scale)}px ${Math.round($height * $scale)}px`};

  > section {
    transform: scale(${({ $scale }) => $scale});
    transform-origin: top left;
  }

  @media print {
    display: block;
    width: auto;
    height: auto;
    border-radius: 0;
    box-shadow: none;
    overflow: visible;
    content-visibility: visible;

    > section {
      transform: none;
    }
  }
`

export const More = styled.p`
  flex: none;
  padding: 12px 18px;
  border-radius: var(--radius-pill);
  background: var(--surface);
  color: var(--dim);
  font-size: var(--font-small);
  font-weight: 600;

  @media print {
    display: none;
  }
`
