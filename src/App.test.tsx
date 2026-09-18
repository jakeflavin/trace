import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'
import { KEYS } from '@/lib/storage'

beforeEach(() => localStorage.clear())

describe('a first visit', () => {
  it('opens on a name sheet with one page', () => {
    render(<App />)
    expect(screen.getByLabelText('Words, one per line')).toHaveValue('Ada')
    const preview = within(screen.getByLabelText('Preview'))
    expect(preview.getAllByRole('region')).toHaveLength(1)
    expect(screen.getByText('One page')).toBeInTheDocument()
  })
})

describe('words', () => {
  it('makes a page per word for a per-word layout', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Words, one per line'), '\nBea\nCy')
    const preview = within(screen.getByLabelText('Preview'))
    expect(preview.getAllByRole('region')).toHaveLength(3)
    expect(screen.getByText('3 words')).toBeInTheDocument()
  })

  it('shares pages for a list layout', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Words, one per line'), '\nBea\nCy')
    await user.click(screen.getByRole('radio', { name: 'Word list' }))
    expect(within(screen.getByLabelText('Preview')).getAllByRole('region')).toHaveLength(1)
  })

  it('imports a file into the list', async () => {
    const user = userEvent.setup()
    render(<App />)
    const file = new File(['Bea\nCy\nAda\n'], 'class.txt', { type: 'text/plain' })
    await user.upload(screen.getByLabelText('Import a list', { selector: 'input' }), file)
    expect(await screen.findByText('Added 2 words')).toBeInTheDocument()
    expect(screen.getByLabelText('Words, one per line')).toHaveValue('Ada\nBea\nCy\nAda\n')
    expect(screen.getByText('3 words')).toBeInTheDocument()
  })

  it('keeps every change in this browser', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('radio', { name: 'Cursive' }))
    expect(localStorage.getItem(KEYS.sheet)).toContain('"font":"cursive"')
  })

  it('prints lined paper when the box is emptied', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(within(screen.getByLabelText('Preview')).getAllByRole('region')).toHaveLength(1)
    expect(screen.getByText('0 words')).toBeInTheDocument()
  })
})

describe('help', () => {
  it('opens and closes the sheet', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getAllByRole('button', { name: 'How it works' })[0]!)
    expect(screen.getByRole('heading', { name: 'How it works' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('heading', { name: 'How it works' })).not.toBeInTheDocument()
  })
})
