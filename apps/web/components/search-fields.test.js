import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import CellButton from '@/components/CellButton'
import SearchCell, { BARE } from '@/components/SearchCell'
import ServicePicker from '@/components/ServicePicker'
import SuggestBox from '@/components/SuggestBox'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: () => {} }) }))

const html = (component, props) => renderToStaticMarkup(createElement(component, props))
const datesCell = () =>
  html(SearchCell, {
    label: 'Dates and times',
    icon: () => null,
    children: (id) => createElement(CellButton, { id }, 'Tue 10 Nov'),
  })

describe('search fields', () => {
  it('shows a ring around the cell that has the focus', () => {
    expect(datesCell()).toContain('focus-within:ring-2')
  })

  // iOS zooms the page when a field with text under 16 px is focused; "text-input" is the 16 px size.
  it.each([
    ['a search cell', () => BARE],
    ['the header search', () => html(SuggestBox, { suggestions: [] }).match(/<input[^>]*>/)[0]],
    [
      'the service picker',
      () => html(ServicePicker, { group: 'car_hire', value: '' }).match(/<label[^>]*>/)[0],
    ],
  ])('types at 16 px on phones in %s', (_name, markup) => {
    expect(markup()).toMatch(/(^|[\s"])text-input[\s"]/)
  })

  // A <label> on a button replaces the button's own text, so a screen reader would never hear the chosen dates.
  it('names a picker button by its label and its chosen value', () => {
    const markup = datesCell()
    const [, labelId] = markup.match(/<label[^>]* id="([^"]+)"/) ?? []
    const [, buttonId] = markup.match(/<button id="([^"]+)"/)
    expect(markup).toContain(`aria-labelledby="${labelId} ${buttonId}"`)
  })
})
