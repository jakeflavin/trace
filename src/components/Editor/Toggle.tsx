import { Switch } from './Editor.styled'

export interface ToggleProps {
  label: string
  note?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Toggle({ label, note, checked, onChange }: ToggleProps) {
  return (
    <Switch>
      <span>
        {label}
        {note && <small>{note}</small>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </Switch>
  )
}
