import { useEffect } from 'react'

/**
 * Calls `onDismiss` on Escape or a tap outside `ref`, while `isActive`. `ref` may be a list, for a control and
 * the panel that opens from it. Escape also reports itself, so the caller can restore focus.
 */
export function useDismiss(ref, isActive, onDismiss) {
  useEffect(() => {
    if (!isActive) return undefined
    const refs = Array.isArray(ref) ? ref : [ref]
    const onKey = (event) => event.key === 'Escape' && onDismiss({ isEscape: true })
    const onPointer = (event) =>
      !refs.some((item) => item.current?.contains(event.target)) && onDismiss({})
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, isActive, onDismiss])
}
