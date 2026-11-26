import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import TabBar from '@/components/TabBar'
import { accountTab } from '@/lib/nav'
import ConsoleShell from '@/components/ConsoleShell'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
// The header's controls need the browser and its providers; only the links matter here.
vi.mock('@/components/AccountMenu', () => ({ default: () => null }))
vi.mock('@/components/CurrencySelector', () => ({ default: () => null }))
vi.mock('@/components/HeaderSearch', () => ({ default: () => null }))
vi.mock('@/components/ThemeToggle', () => ({ default: () => null }))
vi.mock('@/components/AskButton', () => ({ default: () => createElement('button') }))
vi.mock('@/components/ConsentLink', () => ({ default: () => createElement('button') }))
vi.mock('@/components/SignOutForm', () => ({ default: () => null }))

const items = [{ href: '/cars', label: 'Cars', icon: 'car' }]
const html = (component, props) => renderToStaticMarkup(createElement(component, props))
const tabBarEndsAt = (props) =>
  html(TabBar, { items, label: 'Main', ...props }).match(/(md|lg):hidden/)[1]
const topLinksStartAt = (markup) => markup.match(/<nav[^>]*class="hidden [^"]*?(md|lg):flex/)[1]

// A width between the two would have no navigation at all, or two of them.
describe('main navigation', () => {
  it('hands over from the tab bar to the header links at one width', () => {
    expect(tabBarEndsAt()).toBe(topLinksStartAt(html(Header, {})))
  })

  it('hands over to the sidebar at one width in the operator and admin consoles', () => {
    const shell = html(ConsoleShell, { items, area: 'Admin' })
    const sidebarStartsAt = shell.match(/<aside[^>]*class="[^"]*?hidden [^"]*?(md|lg):flex/)[1]
    expect(tabBarEndsAt({ hasTopNavFromTablet: true })).toBe(sidebarStartsAt)
  })
})

describe('the way into an account on a phone', () => {
  it('offers sign in to a visitor, and their own dashboard to someone signed in', () => {
    expect(accountTab(null, false)).toMatchObject({ href: '/auth', label: 'Sign in' })
    expect(accountTab({ home: '/console' }, true)).toMatchObject({ href: '/console' })
    expect(accountTab(null, true)).toMatchObject({ href: '/account' })
    expect(accountTab({ home: '/account' }, true)).toMatchObject({ href: '/account/bookings' })
  })
})

// Hick's law: a short, named group is read and chosen from faster than one long list.
describe('footer choices', () => {
  it('offers at most five in each named group', () => {
    const groups = html(Footer, {}).match(/<ul.*?<\/ul>/g)
    expect(groups.length).toBeGreaterThan(1)
    groups.forEach((group) => expect(group.match(/<li/g).length).toBeLessThanOrEqual(5))
  })
})
