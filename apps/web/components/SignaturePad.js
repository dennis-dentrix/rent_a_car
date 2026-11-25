'use client'

import { useRef } from 'react'
import Button from '@/components/Button'
import { copy } from '@/copy/en'

const text = copy.inspections.sign
const SIZE = { width: 600, height: 200 }

// Where the pointer is on the canvas, whose drawing size differs from its size on screen.
function spot(canvas, event) {
  const box = canvas.getBoundingClientRect()
  return [
    ((event.clientX - box.left) / box.width) * SIZE.width,
    ((event.clientY - box.top) / box.height) * SIZE.height,
  ]
}

function pen(canvas) {
  const context = canvas.getContext('2d')
  Object.assign(context, { lineWidth: 3, lineCap: 'round', lineJoin: 'round', strokeStyle: '#111' })
  return context
}

// Follows the pointer from the moment it lands, and reports the drawing when it lifts.
function useInk(onChange) {
  const ref = useRef(null)
  const isDrawing = useRef(false)
  const start = (event) => {
    isDrawing.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    const context = pen(ref.current)
    context.beginPath()
    context.moveTo(...spot(ref.current, event))
  }
  const move = (event) => {
    if (!isDrawing.current) return
    const context = ref.current.getContext('2d')
    context.lineTo(...spot(ref.current, event))
    context.stroke()
  }
  const end = () => {
    if (!isDrawing.current) return
    isDrawing.current = false
    onChange(ref.current.toDataURL('image/png').split(',')[1])
  }
  const clear = () => {
    ref.current.getContext('2d').clearRect(0, 0, SIZE.width, SIZE.height)
    onChange(null)
  }
  return {
    ref,
    clear,
    handlers: { onPointerDown: start, onPointerMove: move, onPointerUp: end, onPointerCancel: end },
  }
}

/**
 * A box to sign in with a finger, pen, or mouse. The line stays with the pointer even outside the box. `onChange`
 * receives the drawing as base64 PNG, or null when cleared. It is white in both themes so the ink reads the same on
 * screen and in the report.
 */
export default function SignaturePad({ onChange }) {
  const { ref, clear, handlers } = useInk(onChange)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span id="signature-label" className="text-callout font-semibold">
          {text.pad}
        </span>
        <Button type="button" variant="plain" size="sm" onClick={clear}>
          {text.clear}
        </Button>
      </div>
      <canvas
        ref={ref}
        {...SIZE}
        role="img"
        aria-labelledby="signature-label"
        {...handlers}
        className="aspect-[3/1] w-full touch-none rounded-control border border-separator bg-on-hero"
      />
    </div>
  )
}
