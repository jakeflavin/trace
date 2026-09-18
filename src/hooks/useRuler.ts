import { useEffect, useState } from 'react'
import { type FontId, findFont } from '@/lib/fonts'
import { type Ruler, loadFont, measureFont } from '@/lib/metrics'

/**
 * The measured shape of the chosen font, once it has loaded. Null until then, which the
 * layout takes as "use the declared ratios" so the first frame is close and the second is
 * right.
 */
export function useRuler(fontId: FontId): Ruler | null {
  const [rulers, setRulers] = useState<Partial<Record<FontId, Ruler>>>({})

  useEffect(() => {
    if (rulers[fontId]) return
    let live = true
    const font = findFont(fontId)
    loadFont(font).then(() => {
      if (!live) return
      const ruler = measureFont(font)
      if (ruler) setRulers((all) => ({ ...all, [fontId]: ruler }))
    })
    return () => {
      live = false
    }
  }, [fontId, rulers])

  return rulers[fontId] ?? null
}
