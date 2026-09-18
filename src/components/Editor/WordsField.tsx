import { useRef, useState } from 'react'
import { Eraser, Upload } from 'lucide-react'
import { LIMITS, parseWords } from '@/lib/sheet'
import { Field, Ghost, Hint, Row, Tally } from './Editor.styled'

const count = new Intl.NumberFormat()

/** `File.text()` where it exists; jsdom, and older WebKit, only have the reader. */
function readText(file: File): Promise<string> {
  if (typeof file.text === 'function') return file.text()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

export interface WordsFieldProps {
  words: string[]
  onChange: (words: string[]) => void
  onImported: (added: number) => void
}

/**
 * The words, one per line. This is also the bulk import: paste a class list, or pick a
 * text or CSV file, and every line becomes a word.
 *
 * The box keeps its own text rather than showing the parsed list back, or a blank line
 * being typed would vanish under the cursor. The sheet only ever holds the parsed words.
 */
export function WordsField({ words, onChange, onImported }: WordsFieldProps) {
  const [draft, setDraft] = useState(() => words.join('\n'))
  const file = useRef<HTMLInputElement>(null)

  const set = (text: string) => {
    setDraft(text)
    onChange(parseWords(text))
  }

  const importFile = async (picked: File | undefined) => {
    if (!picked) return
    const text = await readText(picked)
    const before = parseWords(draft).length
    const next = draft.trim() ? `${draft.trimEnd()}\n${text}` : text
    set(next)
    onImported(parseWords(next).length - before)
    if (file.current) file.current.value = ''
  }

  return (
    <>
      <Field>
        Words, one per line
        <textarea
          value={draft}
          onChange={(event) => set(event.target.value)}
          placeholder={'Ada\nBea\nCaleb'}
          spellCheck={false}
          autoCapitalize="off"
          rows={5}
        />
      </Field>
      <Row>
        <Ghost type="button" onClick={() => file.current?.click()}>
          <Upload size={15} aria-hidden="true" />
          Import a list
        </Ghost>
        <input
          ref={file}
          type="file"
          accept=".txt,.csv,text/plain,text/csv"
          hidden
          aria-label="Import a list"
          onChange={(event) => importFile(event.target.files?.[0])}
        />
        <Ghost type="button" onClick={() => set('')} disabled={!draft}>
          <Eraser size={15} aria-hidden="true" />
          Clear
        </Ghost>
        <Tally>
          {words.length === 1 ? 'One word' : `${count.format(words.length)} words`}
          {words.length >= LIMITS.words && ' (the most)'}
        </Tally>
      </Row>
      <Hint>
        A name, a spelling list or a whole class. A line with spaces is a sentence. Nothing typed
        here leaves this browser.
      </Hint>
    </>
  )
}
