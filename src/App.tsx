import { useState } from 'react'
import { findFont } from '@/lib/fonts'
import { glyphSource } from '@/lib/glyphs'
import { layoutSheet } from '@/lib/layout'
import { paperSize } from '@/lib/paper'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useRuler } from '@/hooks/useRuler'
import { useSheet } from '@/hooks/useSheet'
import { useTheme } from '@/hooks/useTheme'
import { Editor } from '@/components/Editor/Editor'
import { Header } from '@/components/Header/Header'
import { HelpSheet } from '@/components/Help/HelpSheet'
import { Preview } from '@/components/Preview/Preview'
import { Toast } from '@/components/Toast/Toast'
import { Foot, Form, Main, PrintSetup, Shell, Stage } from './App.styled'

/** Below this the preview is a strip above the form rather than a column beside it. */
const NARROW = '(max-width: 899px)'

const count = new Intl.NumberFormat()

export function App() {
  const [sheet, setSheet] = useSheet()
  const [theme, setTheme] = useTheme()
  const ruler = useRuler(sheet.font)
  const narrow = useMediaQuery(NARROW)
  const [help, setHelp] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  const pages = layoutSheet({ sheet, metrics: ruler?.metrics, measure: ruler?.measure })
  // Spines are found by drawing the font, so they wait for it to load like the ruler does.
  const glyphs = ruler ? glyphSource(findFont(sheet.font)) : null

  return (
    <Shell>
      <PrintSetup $paper={paperSize(sheet.paper).css} />

      <Header
        pages={pages.length}
        theme={theme}
        onTheme={setTheme}
        onHelp={() => setHelp(true)}
        onPrint={() => window.print()}
      />

      <Main>
        <Stage>
          <Preview sheet={sheet} pages={pages} glyphs={glyphs} fitHeight={narrow} />
        </Stage>
        <Form>
          <Editor
            sheet={sheet}
            ruler={ruler}
            glyphs={glyphs}
            onChange={setSheet}
            onImported={(added) =>
              setNote(
                added <= 0
                  ? 'Nothing new in that file'
                  : added === 1
                    ? 'Added one word'
                    : `Added ${count.format(added)} words`,
              )
            }
          />
          <Foot>
            <button type="button" onClick={() => setHelp(true)}>
              How it works
            </button>
            <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            <p>
              The sheet is kept in this browser and nowhere else. Type is Andika, Edu VIC WA NT
              Beginner and Cedarville Cursive, all under the SIL Open Font License.
            </p>
          </Foot>
        </Form>
      </Main>

      <HelpSheet open={help} onClose={() => setHelp(false)} />
      <Toast message={note} onDismiss={() => setNote(null)} />
    </Shell>
  )
}
