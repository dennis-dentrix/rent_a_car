# UI, Accessibility, and Proportion Review

**Date:** 25 November 2026. **Scope:** `apps/web` as it stands in the working tree (uncommitted changes included).

**How it was checked**

- Measured in a browser at 375, 820, and 1440 px: `/` (all three), `/cars`, `/auth/sign-up`, `/cars/economy`, and `/dev/components` (phone and desktop, partly), plus `/dev/console` (phone shell only).
- Read the tokens, global styles, and the shared components.
- **Not checked:** signed-in console and admin pages (code only), dark theme, a screen reader, a real phone, Lighthouse.

Each finding says **Seen** (observed in the browser or computed) or **Code** (read from the source, not exercised).

## 1. Verdict

The foundations are good. The problems are in how they are applied: the type hierarchy is flat, a few controls cannot be seen or reached, and one range of screen widths has no navigation.

**Keep:** one token source with a contrast test, `rem` sizes, pinch zoom allowed, `lang` set, labelled form fields, native `<dialog>` overlays, reduced-motion handling, one `main` and one `h1` on each page measured, no sideways scroll.

## 2. Fix first

| # | Finding | Evidence | Fix | Where |
| --- | --- | --- | --- | --- |
| 1 | **No main navigation from 768 to 1023 px.** The tab bar hides at `md`, the header links appear only at `lg`. Tablets get neither. | Seen at 820 px: both are `display: none` | Hide the tab bar at `lg` (as `design-system.md` §3 says), or show header links from `md` | `TabBar.js:8`, `Header.js:22` |
| 2 | **Search fields show no focus ring.** `outline-none` removes it; the only cue is a white to `#F1F3FF` background change (about 1.1:1). WCAG 2.4.7. | Seen | `focus-within:ring-2 ring-accent ring-inset` on the cell | `SearchCell.js:10` |
| 3 | **Fields at 14 px on phones**, so iOS zooms the page on focus. Breaks the project's own 16 px rule. | Seen: pick-up, header search, service select | Use `text-input md:text-body`, as `Field.js` does | `SearchCell.js:10`, `SuggestBox.js:105`, `ServicePicker.js:21` |
| 4 | **Date button hides its value from screen readers.** A `<label for>` on a button replaces its text, so it reads "Dates and times", never the chosen dates. WCAG 4.1.2. | Seen in the DOM | `aria-labelledby` naming both the label and the button | `SearchCell.js:27`, `DatesField.js:57` |
| 5 | **Car type list is hard to reach by keyboard.** The dropdown is added at the end of `body` and focus does not move into it. The same applies to any control inside `Dropdown`. | Code | Move focus into the panel on open and return it on close | `Dropdown.js:49` |
| 6 | **Place suggestions are silent.** No `aria-activedescendant`, `aria-controls`, or option ids, so arrow keys announce nothing. | Code | Share the listbox logic already correct in `SuggestBox` | `PlaceField.js:141` |
| 7 | **Missing car type shows the stock 404**, black on a light app, with no way back in the page body. There is no `not-found.js` or `error.js`. | Seen | Add branded `not-found.js` and `error.js` | `app/` |

**Update, 25 November 2026: findings 1 to 4 are fixed** (uncommitted). Seen in the browser at 375, 820, and 1280 px, with unit tests in `components/navigation.test.js` and `components/search-fields.test.js`. Not yet tried with a screen reader or on an iPhone. The table above describes the state before the fix.

**Second update, 25 November 2026** (uncommitted): sizes moved to `rem`; the public pages were redrawn to the rules in `design-system.md`, "Plain pages and scalable sizes"; section titles now grow on wide screens; the dimmed unavailable car card and the focus ring on navy panels are fixed. Five public pages show no sideways scroll at 375 px with text at 200%. The reading text size is still the owner's choice. Signed-in console and admin pages were not redrawn or checked.

**Third update, 25 November 2026** (uncommitted): choice and grouping rules applied (`design-system.md`, "Choosing and deciding"); the owner asked for the original hero (badge, headline, gradient) and the logo animation back, and both are restored with a smoother pulse. A home page crash introduced during this work was found in the browser, covered by `components/home-sections.test.js`, and fixed.

## 3. Proportion and type

### What is wrong

| Observation | Evidence |
| --- | --- |
| About 78% of home page text is 14 px; 16 px is rare. This is the "too small" feeling. | Seen, 375 px |
| Section headings do not grow on desktop. `md:text-title-1` is 20 px, the same as the phone size (`title-1-lg` was meant). 16 uses. | Seen and code |
| Section titles (`h2`) and card titles (`h3`) are both 20 px, so sections and cards look equal. | Seen |
| Desktop jumps from a 40 px hero to 20 px headings, separated by 96 px gaps. Large space, small titles. | Seen, `page.js:48` |
| The home intro runs about 110 characters a line (768 px at 14 px). Comfortable reading is 45 to 75. | Seen, `SeoIntro.js` |
| The home page is 7,695 px tall on a phone, about 9.5 screens. | Seen |
| 24 type token names stand for 6 sizes (`footnote`, `caption`, `meta`, `micro`, `staff-heading` are all 12 px). Choosing a name no longer chooses a hierarchy. | Code, `styles/tokens/index.js` |
| With one car type, "Popular car types" is a single small card in a four-column grid. | Seen, 1440 px |

### Proposed scale

Same six sizes as the owner ruling of 25 November 2026. **One change needs the owner's approval:** that ruling sets body at 14/22, and this moves reading text to 16.

| Role | Phone | Desktop | Today |
| --- | --- | --- | --- |
| Hero | 28 | 40 | same |
| Page title (`h1`) | 28 | 28 | 28 / 40 or 28 |
| Section title (`h2`) | 20 | **28** | 20 / 20 |
| Card title (`h3`) | **16** | 20 | 16 or 20, mixed |
| Reading text (paragraphs, descriptions) | **16/24** | **16/24** | 14 |
| Controls, lists, console tables | 14 | 14 | same |
| Captions and badges only | 12 | 12 | also used for navigation and help text |
| Typed text | 16 | 14 or 16 | 14 in search fields |

Also cap reading columns at about `max-w-prose`, and reduce section gaps on desktop from 96 to 64 px.

## 4. Touch targets and control sizes

The project minimum is 44 px (`design-system.md` §4). WCAG 2.2 AA needs 24 px or enough spacing, so most of these miss the project rule rather than the standard.

| Control | Measured | Where |
| --- | --- | --- |
| Footer links | 19 px tall | `Footer.js` |
| Inline "Sign in", "List your fleet" | 19 px tall (inline links are exempt in WCAG) | auth pages |
| Search field input | 22 px tall inside a 64 px cell; make the whole cell focus it | `SearchCell.js` |
| Header search (desktop) | 38 px | `SuggestBox.js` |
| Header icon buttons, home service pills, "See all cars" | 40 px | `Button.js` compact, `IconButton.js` |
| Console filters and ribbon links, 12 px text | 32 px | `AdminFilters.js:19`, `TableToolbar.js:17`, `TopNav.js:48` |
| Small button, compact segmented control | 32 to 36 px | `Button.js:18`, `SegmentedControl.js` |
| Switch | 56 × 32 px | `Switch.js:15` |
| Chip: the 16 px side padding is outside the link, so the edges do not respond | dead zone | `Chip.js:27` |
| Chip remove button | about 24 px | `Chip.js:47` |

Suggested rule: two heights on customer screens (48 primary, 44 everything else); 32 only in desktop console tables.

## 5. Contrast and state

| Finding | Ratio | Need | Where |
| --- | --- | --- | --- |
| Text fields have no border; the fill barely differs from the page | 1.11 (page), 1.17 (card) | 3:1 for a control's boundary (WCAG 1.4.11) | `Field.js:7` |
| Switch in the off position: white knob on pale track | 1.17 | 3:1 | `Switch.js:16` |
| Focus ring on navy panels (hero, closing band) | 2.08 | 3:1 | `globals.css` `:focus-visible` |
| Unavailable car card at `opacity-60` dims readable text | about 3.2 | 4.5:1 | `ClassCard.js:107` |

All **computed** from the token values. Fixes: a field border token at 3:1 or more, a white ring on navy, and a "Not available" badge in place of the opacity. Add these pairs to `contrast.test.js`, which today checks text only.

## 6. Keyboard and screen reader patterns (Code)

- `Menu` and `AccountMenu` declare `role="menu"` but do not move focus in or handle arrow keys; `AccountMenu` does not return focus on Escape.
- `SearchTabs` declares tabs with no arrow keys, `aria-controls`, or tab panel. `SegmentedControl` declares radios with no arrow keys.
- Calendar days are named by raw date (`2026-11-25`) and have no arrow-key movement (`DateRangePicker.js:61`).
- Car type options toggle on Space without stopping the page scroll (`CarTypePicker.js`).
- Table row actions all read "Edit", without the record's name (`ResourceTable.js`).
- No skip link. Landmarks exist, so this is an improvement, not a failure.

Prefer plain buttons and native radios over ARIA roles where the full keyboard behaviour is not built.

## 7. Code quality seen along the way

- `max-w-[1280px]` appears 8 times; `rounded-[6px]` and other arbitrary values break `design-system.md` §15. Add tokens.
- `SignaturePad.js:21` holds a colour (`#111`), against the brand rule.
- `LiveCarCard.js:51-53` builds the same list twice.
- Pill styling is repeated in `AdminFilters.js` and `TableToolbar.js`; popover styling in `Menu.js` and `AccountMenu.js`.

## 8. Seen outside the scope

The local API answered `500 INTERNAL_ERROR` to `GET /api/v1/classes` on all five direct requests during the review, while `/cars` still showed a car type from the web app's cache and `/cars/economy` showed "not found". The cause was not investigated. Check it before release: a price or availability defect blocks release.

## 9. Suggested order

1. Navigation gap, focus ring, 16 px fields, date button name (findings 1 to 4).
2. Type hierarchy: fix `md:text-title-1`, then apply the scale once approved.
3. Control heights and boundaries (sections 4 and 5).
4. Keyboard patterns, 404 and error pages.
5. Run Lighthouse, a screen reader pass, and a real-phone check; review the signed-in console and admin pages.
