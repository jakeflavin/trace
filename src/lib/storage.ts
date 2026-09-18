/**
 * Where the sheet lives: this browser, and nowhere else.
 *
 * Keys are prefixed because every app in the set shares one origin. What is read back is
 * sanitised, so a record written by an older build or edited by hand comes back as a
 * sheet the editor can hold rather than one that throws in render.
 */
import { DEFAULT_SHEET, sanitizeSheet, type Sheet } from './sheet'

export const KEYS = {
  sheet: 'trace.sheet',
  theme: 'trace.theme',
  hint: 'trace.hint',
} as const

export function loadSheet(): Sheet {
  try {
    const raw = localStorage.getItem(KEYS.sheet)
    if (!raw) return DEFAULT_SHEET
    return sanitizeSheet(JSON.parse(raw))
  } catch {
    return DEFAULT_SHEET
  }
}

export function saveSheet(sheet: Sheet): void {
  try {
    localStorage.setItem(KEYS.sheet, JSON.stringify(sheet))
  } catch {
    // Private mode or a full quota: the editor keeps working, the sheet is just not kept.
  }
}
