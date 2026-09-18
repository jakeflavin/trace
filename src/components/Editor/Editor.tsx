import { FONTS } from '@/lib/fonts'
import type { Ruler } from '@/lib/metrics'
import { LIMITS, type Sheet, findLayout, setLayout, setOption, setWords } from '@/lib/sheet'
import { Field, HandCard, HandGrid, Hint, Panel, Section, Toggles } from './Editor.styled'
import { LayoutPicker } from './LayoutPicker'
import { Segmented } from './Segmented'
import { Toggle } from './Toggle'
import { WordsField } from './WordsField'

export interface EditorProps {
  sheet: Sheet
  ruler: Ruler | null
  onChange: (sheet: Sheet) => void
  onImported: (added: number) => void
}

export function Editor({ sheet, ruler, onChange, onImported }: EditorProps) {
  const set = <K extends keyof Sheet>(key: K, value: Sheet[K]) =>
    onChange(setOption(sheet, key, value))
  const layout = findLayout(sheet.layout)

  return (
    <Panel>
      <Section>
        <h2>Words</h2>
        <WordsField
          words={sheet.words}
          onChange={(words) => onChange(setWords(sheet, words))}
          onImported={onImported}
        />
      </Section>

      <Section>
        <h2>Layout</h2>
        <LayoutPicker
          sheet={sheet}
          ruler={ruler}
          onChange={(id) => onChange(setLayout(sheet, id))}
        />
        <Hint>
          {layout.note}{' '}
          {layout.perWord ? 'Every word gets its own page.' : 'The words share the pages.'}
        </Hint>
      </Section>

      <Section>
        <h2>Hand</h2>
        <HandGrid role="radiogroup" aria-label="Hand">
          {FONTS.map((font) => (
            <HandCard
              key={font.id}
              type="button"
              role="radio"
              aria-checked={sheet.font === font.id}
              aria-label={font.label}
              title={font.note}
              $family={font.family}
              $weight={font.weight}
              onClick={() => set('font', font.id)}
            >
              <span aria-hidden="true">Abc</span>
              <b>{font.label}</b>
            </HandCard>
          ))}
        </HandGrid>
      </Section>

      <Section>
        <h2>Letters</h2>
        <Segmented
          label="Letter style"
          value={sheet.stroke}
          options={[
            { value: 'dotted', label: 'Dotted' },
            { value: 'hollow', label: 'Hollow' },
            { value: 'grey', label: 'Grey' },
            { value: 'faint', label: 'Faint' },
          ]}
          onChange={(stroke) => set('stroke', stroke)}
        />
        <Segmented
          label="Size"
          value={sheet.size}
          options={[
            { value: 'large', label: 'Large' },
            { value: 'medium', label: 'Medium' },
            { value: 'small', label: 'Small' },
          ]}
          onChange={(size) => set('size', size)}
        />
        <Segmented
          label="Case"
          value={sheet.letterCase}
          options={[
            { value: 'typed', label: 'As typed' },
            { value: 'title', label: 'Title' },
            { value: 'lower', label: 'lower' },
            { value: 'upper', label: 'UPPER' },
          ]}
          onChange={(letterCase) => set('letterCase', letterCase)}
        />
      </Section>

      <Section>
        <h2>Lines</h2>
        <Segmented
          label="Line colour"
          value={sheet.guides}
          options={[
            { value: 'classic', label: 'Blue and red' },
            { value: 'grey', label: 'Grey' },
            { value: 'black', label: 'Black' },
          ]}
          onChange={(guides) => set('guides', guides)}
        />
        <Toggles>
          <Toggle
            label="Dashed midline"
            note="Where the small letters stop"
            checked={sheet.midline}
            onChange={(on) => set('midline', on)}
          />
          <Toggle
            label="Line for tails"
            note="Where g, p and y reach down to"
            checked={sheet.descender}
            onChange={(on) => set('descender', on)}
          />
          <Toggle
            label="Starting dots"
            note="A green dot where the pencil goes down"
            checked={sheet.startDots}
            onChange={(on) => set('startDots', on)}
          />
        </Toggles>
      </Section>

      <Section>
        <h2>Page</h2>
        <Segmented
          label="Paper"
          value={sheet.paper}
          options={[
            { value: 'letter', label: 'Letter' },
            { value: 'a4', label: 'A4' },
          ]}
          onChange={(paper) => set('paper', paper)}
        />
        <Field>
          Heading
          <input
            value={sheet.title}
            onChange={(event) => set('title', event.target.value)}
            placeholder={layout.perWord ? 'The word itself' : 'Handwriting'}
            maxLength={LIMITS.title}
          />
        </Field>
        <Toggles>
          <Toggle
            label="Name and date"
            note="Blanks in the top corner"
            checked={sheet.nameLine}
            onChange={(on) => set('nameLine', on)}
          />
        </Toggles>
      </Section>
    </Panel>
  )
}
