'use client'

import { useLinkStatus } from 'next/link'
import Spinner from '@/components/Spinner'

/**
 * Inside a link: a spinner from the tap until the next page shows. `children` is what stands there otherwise (an icon),
 * so the link keeps its shape.
 */
export default function LinkPending({ children = null, size, className }) {
  const { pending } = useLinkStatus()
  return pending ? <Spinner size={size} className={className} /> : children
}
