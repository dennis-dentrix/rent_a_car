'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import Dropdown from '@/components/Dropdown'
import SearchCell, { BARE } from '@/components/SearchCell'
import { copy } from '@/copy/en'
import { cx } from '@/lib/cx'
import { fetchPlaces, matchKnownPlaces, mergePlaces, placeText } from '@/lib/places'

const MIN_LETTERS = 2
const WAIT_MS = 250

// The map service's suggestions for the text, a moment after typing stops. Each new letter cancels the last call.
function useRemotePlaces(text) {
  const [places, setPlaces] = useState([])
  const typed = text.trim()
  useEffect(() => {
    if (typed.length < MIN_LETTERS) return undefined
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      const found = await fetchPlaces(typed, controller.signal)
      if (!controller.signal.aborted) setPlaces(found)
    }, WAIT_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [typed])
  return typed.length < MIN_LETTERS ? [] : places
}

function Suggestion({ place, isActive, onPick }) {
  return (
    <li
      role="option"
      aria-selected={isActive}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onPick(place.isKnown ? place.label : placeText(place))}
      className={cx(
        'flex min-h-touch cursor-pointer items-center gap-3 rounded-control px-2 text-body',
        isActive && 'bg-accent-subtle',
      )}
    >
      <MapPin size={18} className="shrink-0 text-primary" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{place.label}</span>
      {place.detail && <span className="shrink-0 text-footnote text-label-2">{place.detail}</span>}
    </li>
  )
}

// Arrow keys move through the suggestions and Enter takes the highlighted one. Enter with nothing highlighted
// keeps what was typed. While the list is open Enter never submits the whole search.
function useListKeys({ isShowing, suggestions, active, setActive, pick, close }) {
  return (event) => {
    if (!isShowing) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((now) => Math.max(-1, Math.min(suggestions.length - 1, now + step)))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const place = suggestions[active]
      if (place) pick(place.isKnown ? place.label : placeText(place))
      else close()
    }
  }
}

// The open state, the highlighted suggestion, and the suggestions themselves for one place box.
function usePlaceField({ known, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const cell = useRef(null)
  const remote = useRemotePlaces(value)
  const suggestions = mergePlaces(matchKnownPlaces(known, value), remote)
  const typed = value.trim()
  const isShowing = isOpen && (suggestions.length > 0 || Boolean(typed))
  const anchor = useCallback((input) => {
    cell.current = input?.closest('[data-search-cell]') ?? null
  }, [])
  const pick = (text) => {
    onChange(text)
    setIsOpen(false)
  }
  const close = () => setIsOpen(false)
  const onKeyDown = useListKeys({ isShowing, suggestions, active, setActive, pick, close })
  const type = (text) => {
    onChange(text)
    setActive(-1)
    setIsOpen(true)
  }
  return {
    cell,
    anchor,
    active,
    suggestions,
    typed,
    isShowing,
    pick,
    close,
    onKeyDown,
    type,
    open: () => setIsOpen(true),
  }
}

function PlaceList({ field }) {
  return (
    <>
      <ul role="listbox" aria-label={copy.places.suggestions}>
        {field.suggestions.map((place, index) => (
          <Suggestion
            key={place.id}
            place={place}
            isActive={index === field.active}
            onPick={field.pick}
          />
        ))}
      </ul>
      {field.typed && (
        <p className="px-2 py-2 text-footnote text-label-2">{copy.places.typedHint}</p>
      )}
    </>
  )
}

/**
 * A place the renter types. The text in the box is the final location as typed; a dropdown under it offers matches
 * from our own places and, when a map service is connected, from the map. Choosing one replaces the text.
 */
export default function PlaceField({ icon, label, placeholder, known, value, onChange }) {
  const field = usePlaceField({ known, value, onChange })
  return (
    <>
      <SearchCell icon={icon} label={label} onClear={value ? () => onChange('') : undefined}>
        {(id) => (
          <input
            id={id}
            ref={field.anchor}
            role="combobox"
            aria-expanded={field.isShowing}
            aria-autocomplete="list"
            autoComplete="off"
            value={value}
            placeholder={placeholder}
            onFocus={field.open}
            onKeyDown={field.onKeyDown}
            onChange={(event) => field.type(event.target.value)}
            className={BARE}
          />
        )}
      </SearchCell>
      <Dropdown isOpen={field.isShowing} onClose={field.close} anchorRef={field.cell}>
        <PlaceList field={field} />
      </Dropdown>
    </>
  )
}
