import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SHEET,
  addWords,
  applyCase,
  parseWords,
  removeWord,
  sanitizeSheet,
  titleOf,
} from './sheet'

describe('parseWords', () => {
  it('takes one word per line and drops blanks and repeats', () => {
    expect(parseWords('Ada\n\n  Bea \nAda\nCy')).toEqual(['Ada', 'Bea', 'Cy'])
  })

  it('splits a single pasted line on commas', () => {
    expect(parseWords('Ada, Bea,Cy')).toEqual(['Ada', 'Bea', 'Cy'])
  })

  it('keeps commas inside a sentence when there are several lines', () => {
    expect(parseWords('Hello, world\nBye')).toEqual(['Hello, world', 'Bye'])
  })

  it('clamps the count and the length', () => {
    const many = Array.from({ length: 150 }, (_, i) => `w${i}`).join('\n')
    expect(parseWords(many)).toHaveLength(100)
    expect(parseWords('x'.repeat(200))[0]).toHaveLength(60)
  })
})

describe('edits', () => {
  it('adds and removes words', () => {
    const added = addWords(DEFAULT_SHEET, 'Bea\nCy')
    expect(added.words).toEqual(['Ada', 'Bea', 'Cy'])
    expect(removeWord(added, 1).words).toEqual(['Ada', 'Cy'])
  })

  it('cases words', () => {
    expect(applyCase('ada LOVELACE', 'title')).toBe('Ada Lovelace')
    expect(applyCase('Ada', 'upper')).toBe('ADA')
    expect(applyCase('Ada', 'lower')).toBe('ada')
    expect(applyCase('aDa', 'typed')).toBe('aDa')
  })

  it('titles a per-word page after the word and a shared page generically', () => {
    expect(titleOf(DEFAULT_SHEET, 'Ada')).toBe('Ada')
    expect(titleOf({ ...DEFAULT_SHEET, layout: 'list' }, null)).toBe('Handwriting')
    expect(titleOf({ ...DEFAULT_SHEET, title: ' Spelling ' }, 'Ada')).toBe('Spelling')
  })
})

describe('sanitizeSheet', () => {
  it('returns the default for junk', () => {
    expect(sanitizeSheet(null)).toEqual(DEFAULT_SHEET)
    expect(sanitizeSheet('x')).toEqual(DEFAULT_SHEET)
  })

  it('keeps known values and replaces unknown ones', () => {
    const out = sanitizeSheet({ words: ['Bea', 3], layout: 'cards', font: 'nope', size: 'small' })
    expect(out.words).toEqual(['Bea'])
    expect(out.layout).toBe('cards')
    expect(out.font).toBe('print')
    expect(out.size).toBe('small')
  })
})
