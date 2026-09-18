import { useLayoutEffect, useRef, useState } from 'react'

/**
 * The scale that fits a page of a fixed size into whatever box it is given.
 *
 * Pages are laid out at their printed size and scaled down to be looked at; a page is
 * never scaled up, because a phone showing a sheet at 1.4× would be a lie about
 * what comes out of the printer.
 */
export function useFit(pageWidth: number, pageHeight: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const measure = () => setBox({ width: node.clientWidth, height: node.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const byWidth = box.width > 0 ? box.width / pageWidth : 1
  // An infinite page height means "fit the width only"; the box's height is not a limit.
  const byHeight = box.height > 0 && Number.isFinite(pageHeight) ? box.height / pageHeight : 1
  const scale = Math.min(1, byWidth, byHeight)

  return { ref, scale }
}
