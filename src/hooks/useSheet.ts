import { useCallback, useEffect, useState } from 'react'
import type { Sheet } from '@/lib/sheet'
import { loadSheet, saveSheet } from '@/lib/storage'

/** The one sheet, kept in this browser between visits. */
export function useSheet(): [Sheet, (next: Sheet | ((sheet: Sheet) => Sheet)) => void] {
  const [sheet, setSheet] = useState<Sheet>(loadSheet)

  useEffect(() => {
    saveSheet(sheet)
  }, [sheet])

  const update = useCallback((next: Sheet | ((sheet: Sheet) => Sheet)) => {
    setSheet(next)
  }, [])

  return [sheet, update]
}
