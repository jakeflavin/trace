import styled from 'styled-components'

export const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 20px 16px 8px;
`

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;

  > h2 {
    font-size: var(--font-small);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--dim);
  }
`

export const Hint = styled.p`
  color: var(--dim);
  font-size: var(--font-small);
`

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: var(--font-small);
  font-weight: 600;

  input,
  textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--surface);
    font-size: var(--font-body);
    font-weight: 500;
    resize: vertical;

    &::placeholder {
      color: var(--dim);
      font-weight: 400;
    }

    &:focus {
      outline: 3px solid var(--accent);
      outline-offset: 0;
      border-color: transparent;
    }
  }

  textarea {
    min-height: 118px;
    line-height: 1.5;
    font-variant-numeric: tabular-nums;
  }
`

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`

export const Ghost = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: var(--surface);
  color: var(--text);
  font-size: var(--font-small);
  font-weight: 700;

  &:hover:not(:disabled) {
    background: var(--surface-hi);
  }

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
`

export const Tally = styled.p`
  margin-left: auto;
  color: var(--dim);
  font-size: var(--font-small);
  font-weight: 600;
`

/* ------------------------------------------------------------ segmented */

export const Segment = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 3px;
  padding: 3px;
  border-radius: var(--radius);
  background: var(--surface-sunk);

  button {
    min-width: 0;
    padding: 8px 6px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: var(--dim);
    font-size: var(--font-small);
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      color: var(--text);
    }

    &[aria-checked='true'] {
      background: var(--surface);
      color: var(--text);
      box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
    }
  }
`

/* ------------------------------------------------------------- toggles */

export const Switch = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  font-size: var(--font-small);
  font-weight: 600;
  cursor: pointer;

  span {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  small {
    color: var(--dim);
    font-weight: 500;
  }

  input {
    appearance: none;
    flex: none;
    width: 38px;
    height: 22px;
    margin: 0;
    border-radius: var(--radius-pill);
    background: var(--surface-sunk);
    position: relative;
    cursor: pointer;
    transition: background 120ms;

    &::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--surface);
      box-shadow: 0 1px 2px rgb(0 0 0 / 0.25);
      transition: transform 120ms;
    }

    &:checked {
      background: var(--accent);
    }

    &:checked::after {
      transform: translateX(16px);
    }
  }
`

export const Toggles = styled.div`
  display: grid;
  gap: 8px;
`

/* -------------------------------------------------------- layout picker */

export const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 899px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

export const LayoutCard = styled.button`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px 6px 8px;
  border: 2px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  text-align: left;

  &:hover {
    border-color: var(--dim);
  }

  &[aria-checked='true'] {
    border-color: var(--accent);
    background: var(--accent-soft);
  }

  b {
    font-size: var(--font-tiny);
    font-weight: 700;
    line-height: 1.2;
  }
`

export const Thumb = styled.div`
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--line);
  /* The thumbnail is paper; the border keeps white paper visible on a white surface. */
  background: #ffffff;
`

/* ------------------------------------------------------------ hand pick */

export const HandGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
`

export const HandCard = styled.button<{ $family: string; $weight: number }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 10px;
  border: 2px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  text-align: left;

  &:hover {
    border-color: var(--dim);
  }

  &[aria-checked='true'] {
    border-color: var(--accent);
    background: var(--accent-soft);
  }

  span {
    font-family: '${({ $family }) => $family}', cursive;
    font-weight: ${({ $weight }) => $weight};
    font-size: 26px;
    line-height: 1.2;
  }

  b {
    font-size: var(--font-tiny);
    font-weight: 700;
  }
`
