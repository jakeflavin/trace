import { useEffect } from 'react'
import { Pill } from './Toast.styled'

export interface ToastProps {
  message: string | null
  actionLabel?: string
  onAction?: () => void
  onDismiss: () => void
}

/** Says what just happened, and offers the way back. */
export function Toast({ message, actionLabel, onAction, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(onDismiss, 6000)
    return () => window.clearTimeout(timer)
  }, [message, onDismiss])

  if (!message) return null

  return (
    <Pill role="status">
      <span>{message}</span>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={() => {
            onAction()
            onDismiss()
          }}
        >
          {actionLabel}
        </button>
      )}
    </Pill>
  )
}
