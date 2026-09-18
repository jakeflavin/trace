import styled from 'styled-components'

export const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 60px;
  padding: 0 16px;
  background: var(--bg);
  border-bottom: 1px solid var(--line);

  @media print {
    display: none;
  }
`

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;

  b {
    font-size: 19px;
    font-weight: 800;
    letter-spacing: -0.03em;
  }
`

export const Tile = styled.svg`
  width: 30px;
  height: 30px;
  flex: none;
`

export const Count = styled.p`
  flex: 1;
  min-width: 0;
  color: var(--dim);
  font-size: var(--font-small);
  font-weight: 600;
  text-align: right;
  padding-right: 6px;
`

export const Tools = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  flex: none;
`

export const Tool = styled.button<{ $hideOnPhone?: boolean }>`
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--dim);

  &:hover:not(:disabled) {
    background: var(--surface-hi);
    color: var(--text);
  }

  /* A phone has room for the count and Print; help and theme live in the footer. */
  @media (max-width: 560px) {
    display: ${({ $hideOnPhone }) => ($hideOnPhone ? 'none' : 'grid')};
  }
`

export const Primary = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  margin-left: 6px;
  padding: 0 16px 0 14px;
  border: 0;
  border-radius: var(--radius-pill);
  background: var(--accent);
  color: var(--ink);
  font-weight: 700;

  &:hover {
    background: var(--accent-hi);
  }
`
