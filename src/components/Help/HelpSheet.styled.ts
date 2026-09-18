import styled from 'styled-components'

export const Dialog = styled.dialog`
  width: min(520px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  max-height: calc(100dvh - 32px);
  overflow: auto;
  border-radius: var(--radius-lg);
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow);
`

export const Body = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;

  h2 {
    font-size: 22px;
  }

  h3 {
    margin-top: 8px;
    font-size: var(--font-body);
  }

  ol,
  ul {
    margin: 0;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  p,
  li {
    font-size: var(--font-small);
    line-height: 1.5;
  }

  p {
    color: var(--dim);
  }
`

export const Close = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: var(--surface-hi);
  color: var(--text);
`
