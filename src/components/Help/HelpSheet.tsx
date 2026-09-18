import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Body, Close, Dialog } from './HelpSheet.styled'

export interface HelpSheetProps {
  open: boolean
  onClose: () => void
}

/** What the app is for and how to get the best out of the paper, in one sheet. */
export function HelpSheet({ open, onClose }: HelpSheetProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  if (!open) return null

  return (
    <Dialog
      ref={ref}
      aria-labelledby="help-title"
      onCancel={(event) => {
        // Escape asks; the parent's state decides, or the dialog could never reopen.
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <Body>
        <Close type="button" onClick={onClose} aria-label="Close">
          <X size={18} aria-hidden="true" />
        </Close>
        <h2 id="help-title">How it works</h2>
        <ol>
          <li>Type a word. A child’s name is the usual first one.</li>
          <li>Pick a layout. Each is drawn from your own words, so what you see is the page.</li>
          <li>Pick the hand, the size and how the letters are drawn.</li>
          <li>Press Print. Every word in the list gets its pages, in order.</li>
        </ol>
        <h3>For a whole class</h3>
        <p>
          Paste the list into the words box, one name per line, or import a text or CSV file. A
          per-word layout makes a sheet for every name. The list, cards and sentence layouts put
          them together.
        </p>
        <h3>On the paper</h3>
        <ul>
          <li>Large is for a first pencil. Small suits a child already writing sentences.</li>
          <li>Dotted letters are for tracing over. Grey and faint are for writing on top of.</li>
          <li>Fade away is a whole lesson on one page: copy, then trace, then write alone.</li>
          <li>Print at 100%, not “fit to page”, and the lines come out at the size shown.</li>
        </ul>
        <p>Nothing is saved anywhere but this browser. There is no account.</p>
      </Body>
    </Dialog>
  )
}
