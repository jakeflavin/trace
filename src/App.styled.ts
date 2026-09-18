import styled, { createGlobalStyle } from 'styled-components'

/*
 * A fixed height, not a minimum: a flex container that is auto-height sizes to its
 * content regardless of what its items ask for, and the whole page would scroll instead
 * of the two columns.
 */
export const Shell = styled.div`
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;

  @media print {
    height: auto;
    display: block;
  }
`

/*
 * The paper follows the sheet's choice, so it cannot live in the global stylesheet;
 * injected on mount is early enough, since nobody prints before the app has rendered.
 * Zero margin: the page carries its own, inside the printable area.
 */
export const PrintSetup = createGlobalStyle<{ $paper: string }>`
  @page {
    size: ${({ $paper }) => $paper};
    margin: 0;
  }
`

export const Main = styled.div`
  flex: 1;
  /* A flex item's minimum is its content unless told otherwise; this one has to shrink. */
  min-height: 0;
  display: grid;
  grid-template-columns: 420px minmax(0, 1fr);
  /* The row must not size to its content, or the columns cannot scroll on their own. */
  grid-template-rows: minmax(0, 1fr);
  grid-template-areas: 'form stage';

  @media (max-width: 899px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    grid-template-areas:
      'stage'
      'form';
  }

  @media print {
    display: block;
    height: auto;
  }
`

export const Stage = styled.div`
  grid-area: stage;
  min-height: 0;
  overflow-y: auto;
  background: var(--surface-sunk);

  @media (max-width: 899px) {
    /* Short enough to leave the form room, tall enough that a page is legible. */
    height: 38vh;
    height: 38dvh;
    min-height: 240px;
    overflow: hidden;
    border-bottom: 1px solid var(--line);
  }

  @media print {
    overflow: visible;
    background: none;
  }
`

export const Form = styled.div`
  grid-area: form;
  min-height: 0;
  overflow-y: auto;
  border-right: 1px solid var(--line);
  background: var(--bg);

  @media (max-width: 899px) {
    border-right: 0;
  }

  @media print {
    display: none;
  }
`

export const Foot = styled.footer`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 6px;
  padding: 0 16px 32px;
  color: var(--dim);
  font-size: var(--font-tiny);
  line-height: 1.5;

  button {
    padding: 6px 12px;
    border: 1px solid var(--line);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--text);
    font-size: var(--font-tiny);
    font-weight: 700;

    &:hover {
      background: var(--surface-hi);
    }
  }

  p {
    width: 100%;
    margin-top: 8px;
  }
`
