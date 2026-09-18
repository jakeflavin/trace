import { describe, expect, it } from 'vitest'
import { type Bitmap, skeletonize, thin } from './skeleton'

function draw(width: number, height: number, ink: (x: number, y: number) => boolean): Bitmap {
  const data = new Uint8Array(width * height)
  for (let y = 0; y < height; y += 1)
    for (let x = 0; x < width; x += 1) if (ink(x, y)) data[y * width + x] = 1
  return { width, height, data }
}

describe('thin', () => {
  it('reduces a bar to a single line of pixels', () => {
    const bar = draw(60, 20, (x, y) => x >= 5 && x < 55 && y >= 6 && y < 14)
    const bone = thin(bar)
    const rows = new Set<number>()
    for (let y = 0; y < 20; y += 1)
      for (let x = 20; x < 40; x += 1) if (bone.data[y * 60 + x]) rows.add(y)
    expect(rows.size).toBe(1)
    expect([...rows][0]).toBeGreaterThanOrEqual(8)
    expect([...rows][0]).toBeLessThanOrEqual(11)
  })
})

describe('skeletonize', () => {
  it('turns a bar into one stroke down its middle, with its width measured', () => {
    const { strokes, stem } = skeletonize(
      draw(60, 20, (x, y) => x >= 5 && x < 55 && y >= 6 && y < 14),
    )
    expect(strokes).toHaveLength(1)
    for (const p of strokes[0]!) expect(Math.abs(p.y - 9.5)).toBeLessThan(1.5)
    expect(stem).toBeGreaterThan(6)
    expect(stem).toBeLessThan(10)
  })

  it('turns a ring into one closed stroke', () => {
    const { strokes } = skeletonize(
      draw(60, 60, (x, y) => {
        const r = Math.hypot(x - 30, y - 30)
        return r >= 16 && r <= 24
      }),
    )
    expect(strokes).toHaveLength(1)
    const stroke = strokes[0]!
    const first = stroke[0]!
    const last = stroke[stroke.length - 1]!
    expect(Math.hypot(first.x - last.x, first.y - last.y)).toBeLessThan(2)
    for (const p of stroke) expect(Math.abs(Math.hypot(p.x - 30, p.y - 30) - 20)).toBeLessThan(2.5)
  })

  it('keeps an L as one stroke and a T as more than one', () => {
    const ell = skeletonize(
      draw(
        50,
        50,
        (x, y) =>
          (x >= 10 && x < 18 && y >= 5 && y < 45) || (y >= 37 && y < 45 && x >= 10 && x < 45),
      ),
    )
    expect(ell.strokes).toHaveLength(1)
    const tee = skeletonize(
      draw(
        50,
        50,
        (x, y) => (x >= 21 && x < 29 && y >= 5 && y < 45) || (y >= 5 && y < 13 && x >= 5 && x < 45),
      ),
    )
    expect(tee.strokes.length).toBeGreaterThanOrEqual(2)
    const total = tee.strokes.reduce((n, s) => n + s.length, 0)
    expect(total).toBeGreaterThan(4)
  })
})
