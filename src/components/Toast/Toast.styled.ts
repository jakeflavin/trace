import styled from 'styled-components'

export const Pill = styled.div`
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 8;
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: calc(100vw - 32px);
  border-radius: var(--radius-pill);
  background: var(--text);
  color: var(--surface);
  padding: 12px 12px 12px 20px;
  font-weight: 600;
  font-size: var(--font-small);
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.25);

  button {
    border: 0;
    border-radius: var(--radius-pill);
    background: var(--surface);
    color: var(--text);
    padding: 8px 14px;
    font-weight: 700;
    font-size: var(--font-small);
  }
`
