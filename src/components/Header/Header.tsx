import { CircleHelp, Moon, Printer, Sun } from 'lucide-react'
import type { Theme } from '@/hooks/useTheme'
import { Bar, Brand, Count, Primary, Tool, Tools } from './Header.styled'
import { Mark } from './Mark'

const count = new Intl.NumberFormat()

export interface HeaderProps {
  pages: number
  theme: Theme
  onTheme: (theme: Theme) => void
  onHelp: () => void
  onPrint: () => void
}

export function Header({ pages, theme, onTheme, onHelp, onPrint }: HeaderProps) {
  const dark = theme === 'dark'

  return (
    <Bar>
      <Brand>
        <Mark />
        <b>Trace</b>
      </Brand>

      <Count role="status">{pages === 1 ? 'One page' : `${count.format(pages)} pages`}</Count>

      <Tools>
        <Tool onClick={onHelp} aria-label="How it works" $hideOnPhone>
          <CircleHelp size={19} aria-hidden="true" />
        </Tool>
        <Tool
          onClick={() => onTheme(dark ? 'light' : 'dark')}
          aria-label={dark ? 'Switch to light' : 'Switch to dark'}
          $hideOnPhone
        >
          {dark ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
        </Tool>
        <Primary onClick={onPrint}>
          <Printer size={18} aria-hidden="true" />
          <span>Print</span>
        </Primary>
      </Tools>
    </Bar>
  )
}
