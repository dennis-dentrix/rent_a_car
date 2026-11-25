# Design System Specification

**Purpose:** Keeps the interface consistent. Defines the tokens (colour, type, spacing, shape, depth, motion), the rules for using them, the logo, the mobile patterns, and the accessibility baseline. Components are specified in `ui-component-library.md`; the build order is in `ui-build-plan.md`.

**Source and direction:** The Stitch "Executive Concierge Mobility" system (`DESIGN.md` and ten screens, held outside the repository), adapted toward Apple's interface language and written mobile first. Owner decisions: Stitch designs adopted, 23 November 2026; Nunito Sans as the one typeface, 23 November 2026. Where a Stitch value and this document differ, this document wins; the changes are listed in section 14.

## 1. Principles

1. Design the 390 px phone screen first and check it at 360 px. Then widen. One column under 768 px.
2. One primary action per screen, at most one secondary. Other options sit behind a sheet or a "More".
3. Tokens are the only source of values, named by meaning (`label`, `accent`), never by palette step. No raw hex, pixel, or font size in components.
4. Light is the default on every device and ignores the device's dark mode (owner ruling, 23 November 2026). Dark is defined from the start, tuned not inverted, and applies only when `data-theme="dark"` is set on `<html>`, by the appearance switch (Light, Dark, System), which saves the choice on the device and applies it before the first paint.
5. Customer text is never below 12 px, body and inputs are 16 px (smaller makes iOS zoom the page on focus).
6. Money, plates, dates, and durations use tabular numerals.
7. Colour never carries meaning alone: status pairs an icon or a word with its colour.
8. Accessibility is part of the spec, not a later check.
9. A new token is added only when an existing one cannot express the need.

## 2. Colour

Names are meaning-based. Tailwind utilities use the same names (`bg-bg-grouped`, `text-label-2`, `bg-accent`).

| Token            | Light     | Dark                    | Use                                              |
| ---------------- | --------- | ----------------------- | ------------------------------------------------ |
| `bg`             | #F9F9FF   | #0B0F1A                 | Page                                             |
| `bg-grouped`     | #F1F3FF   | #121828                 | Behind inset lists, section bands                |
| `surface`        | #FFFFFF   | #1A2133                 | Cards, sheets                                    |
| `fill`           | #E9EDFF   | #232B40                 | Inputs, tonal controls, skeleton                 |
| `label`          | #141B2B   | #F2F4FA                 | Primary text                                     |
| `label-2`        | #424753   | #B4BACB                 | Secondary text, metadata                         |
| `label-3`        | #646A78   | #9097AB                 | Placeholders and disabled only (4.5:1)           |
| `separator`      | #DCE2F7   | #2B3349                 | Hairlines and card borders                       |
| `primary`        | #00459C   | derived, lighter        | Buttons, prices, eyebrow labels, links (Stitch "primary") |
| `on-primary`     | #FFFFFF   | #0B0F1A                 | Text on primary                                  |
| `tertiary` / `tertiary-bg` | #713B00 / #FFDCC3 | #FFB77D / amber 18% | Peach accents: icon tiles, warm highlights |
| `accent`         | brand     | brand dark              | Primary action, links, selected (#0A5CC8 / #4C9AFF) |
| `accent-pressed` | #074290   | #7EB6FF                 | Pressed                                          |
| `accent-subtle`  | accent at 14% | accent at 16%       | Tonal fill, selected chip, active tab pill       |
| `on-accent`      | #FFFFFF   | #0B0F1A                 | Text on accent                                   |
| `verified`       | #92400E   | #FFB77D                 | Vetted-operator text and icon                    |
| `verified-bg`    | #FEF3C7   | rgba(245,158,11,.16)    | Vetted badge background                          |
| `success`        | #166534   | #34D399                 | Confirmed                                        |
| `warning`        | #9A4A07   | #FBBF24                 | Pending, attention                               |
| `error`          | #BA1A1A   | #FF8A80                 | Errors, rejected                                 |
| `info`           | #0A5CC8   | #4C9AFF                 | Information                                      |
| `whatsapp`       | #25D366   | #25D366                 | WhatsApp button only, with `label` ink text      |

- **Status backgrounds:** each status colour has a `*-bg` token, the colour at 12 percent over `bg` in light and 20 percent in dark. Text on it passes 4.5:1 in both themes.
- **Layering (Stitch pattern):** sections sit on a blue-tinted `bg-grouped` band with white `surface` cards on top; small uppercase `primary` eyebrow labels sit above section titles; the navy `hero` gradient (navy, primary, accent) is used for the hero, one feature panel, and the closing band; peach, green, and blue icon tiles add variety.
- **Amber** (`verified`, and `mark-pin` #D97706 for the logo dot) marks proof only: vetted operators, verified documents. Never decoration.
- **Brand source:** `packages/shared/src/brand.js` holds the name, `accent`, `accentDark`, and `markPin`. `styles/tokens` and the Tailwind config derive every other token from it. No component contains a brand name or colour.
- **Derived values:** `accent-pressed` is the accent mixed 28% toward black (light) or white (dark); `accent-subtle` is the accent at 14% (light) or 16% (dark).
- **Contrast:** `apps/web/styles/tokens/contrast.test.js` checks every text token on every surface and tint in both themes (4.5:1, `label-3` included: Lighthouse counts a visible placeholder as text). Body text 4.5:1, large text and icons 3:1, checked per token pair in both themes at the Phase 0 gate. `label-3` is still only for placeholders and disabled states.

## 3. Typography

### One type ramp (owner, 25 November 2026)

Every page uses six sizes: 12, 14, 16, 20, 28, and 40 px (40 for the desktop hero only). Body text is 14/22. Text typed into a field is 16 px on phones, so iOS does not zoom. This replaces the sizes in the table below and principle 5's 16 px body; `apps/web/styles/tokens/index.js` is the source.

**Nunito Sans**, one family, variable (weights 400 to 700 used), loaded with `next/font/google` (self-hosted, `display: swap`, only this family). Owner decision, 23 November 2026, replacing the monospace choice of the same day. The fallback is the system sans stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`. Large text is tightened a little and small uppercase text opened a little (the tracking column below). `.num` sets the tabular figures for money, plates, dates, and durations, so columns line up. Sizes are in `rem` so the user's text-size setting scales them. The header links appear from `lg` and the phone tab bar covers smaller screens.

| Token      | Phone / desktop        | Weight | Tracking | Use                                     |
| ---------- | ---------------------- | ------ | -------- | --------------------------------------- |
| `display`  | 34/40 and 44/52        | 700    | 0        | Hero, large title                       |
| `title-1`  | 28/34 and 32/40        | 600    | -0.025em | Page title                              |
| `title-2`  | 22/28                  | 600    | -0.02em  | Section heading                         |
| `headline` | 17/24                  | 600    | -0.01em  | Card title, list title                  |
| `body`     | 16/24                  | 400    | -0.005em | Body, inputs                            |
| `callout`  | 15/22                  | 400    | 0        | Secondary text                          |
| `footnote` | 13/18                  | 400    | 0        | Captions, legal                         |
| `caption`  | 12/16                  | 500    | +0.02em  | Badges and labels (uppercase allowed)   |
| `price`    | 22/28                  | 700    | -0.02em  | Totals and rates, with `.num`           |

Staff desktop density: `staff-label` 14/20 at 400 for labels and table text; `staff-heading` 12/16 at 600 uppercase. On customer screens text never goes below 12 px, and nothing actionable is below 15 px.

`.num` sets `font-variant-numeric: tabular-nums slashed-zero`. It is applied to every `Price`, plate, VIN, date, and duration.

## 4. Spacing, shape, and depth

- **Spacing** (4 px steps, as in Tailwind: `p-1` is 4 px, `p-4` is 16 px, `p-6` is 24 px). The design uses 4, 8, 12, 16, 24, 32, 48, and 64 px; other steps fill the gaps for layout.
- **Sizes:** `size.touch` 44 px minimum, 48 px for primary buttons and inputs, 32 px staff rows, tab bar 64 px plus the safe-area inset, compact buttons 40 px, header 56 px on phones and 72 px from tablet up.
- **Radius:** `radius.control` 8 (buttons, inputs), `radius.card` 12, `radius.panel` 16, `radius.sheet` 20 at the top corners, `radius.pill` 999 (chips, badges).
- **Depth:** hierarchy comes first from tone and a 1 px `separator` border, then from shadow. `elevation.1` (cards): `0 1px 3px rgba(17,24,39,.04), 0 8px 24px rgba(8,47,106,.04)`. `elevation.2` (sheets, pickers): `0 12px 40px rgba(17,24,39,.08)`; dark values are black-based and stronger.
- **Translucency:** sticky headers and floating bars use 85 percent `surface` with `backdrop-filter: blur(20px) saturate(180%)`, solid where unsupported.
- **Layers:** `z.header` 100, `z.stickyBar` 200, `z.sheet` 300, `z.dialog` 400, `z.toast` 500.

## 5. Motion

| Token             | Duration | Curve                         | Use                                  |
| ----------------- | -------- | ----------------------------- | ------------------------------------ |
| `motion.fast`     | 120 ms   | ease-out                      | Press feedback, toggles              |
| `motion.standard` | 250 ms   | `cubic-bezier(0.2, 0, 0, 1)`  | Sheets, panels, the segmented pill   |
| `motion.slow`     | 400 ms   | ease-in-out                   | Large layout changes only            |

Sheets and the segmented pill follow the finger and can be interrupted. With reduced motion, transitions become fades or instant. Nothing loops except loading indicators.

## 6. Layout and breakpoints

| Token        | Width          | Columns and margin | Target                                                |
| ------------ | -------------- | ------------------ | ----------------------------------------------------- |
| `bp.phone`   | 0 to 767 px    | 1 column, 16 px    | Default styles                                        |
| `bp.tablet`  | 768 px and up  | 8 columns, 24 px   | Two-column layouts; staff rail appears                |
| `bp.desktop` | 1024 px and up | 12 columns, 40 px  | Full staff sidebar                                    |
| `bp.wide`    | 1440 px and up | content 1280 px    | Maximum content width                                 |

Gutter 12 px phone, 16 px tablet, 20 px desktop. Tailwind: `md` 768, `lg` 1024, `wide` 1440. Primary actions sit in the lower half of a phone screen, within thumb reach. Cards inside cards are avoided: use grouped sections, spacing, and hairlines.

## 7. Iconography

Lucide (ISC licence) is the only icon set; Material 3 symbols are an allowed alternative but are not mixed in. No emoji and no second icon set in the interface. The logo mark and the car drawings are artwork, not icons. Lucide, 1.5 px stroke, 24 px grid, 20 px rendered in controls. All outline, never mixed with filled icons in one row. Icons sit beside a label for key actions; icon-only buttons carry an accessible name.

## 8. Logo

The "C" transit arc with the amber arrival dot is the mark. No shield container in the product; a blue tile holds the mark only for the app icon. Deliverables, all SVG:

1. Mark in `currentColor`, with the dot in `mark-pin`.
2. Favicon and tab-bar variant without the dot, checked at 16 px.
3. Single-colour version for dark mode, print, and the vehicle decal.
4. Wordmark "Carvo" in the app typeface in semibold, slight negative tracking. One treatment only.
5. App icon (mark on the blue tile).

The header shows the mark and "Carvo" only. The descriptor lines ("Mobility", "by Dirant Technologies") belong in the footer and About page. Colours come from `brand.js`. Clear space around the mark is the height of the dot, and no distortion, shadow, or gradient. Brand-book extras (decals, card mock-ups) are not part of the product.

## 9. Focus, states, and interaction

- Focus ring: 2 px accent outline, 2 px offset, always visible on keyboard focus.
- Every interactive component defines default, hover (pointer only), pressed, focus, disabled, loading, and error where relevant.
- Pressed feedback: scale to 0.97 or a state layer (hover 8 percent, pressed 12 percent of the control's colour). Nothing depends on hover.
- Disabled controls keep their label and show the reason nearby.
- Touch targets never overlap, with at least 8 px between them.
- Optimistic UI: the screen updates at once, shows "saving" until the server answers, and rolls back with a plain message. Price, status, payment, and availability come from the server.

## 10. Navigation patterns

- Links navigate and change the URL. Buttons change state.
- Phone customers get a **tab bar** of three items (UX spec limit); staff get four. Each tab is a 24 px icon with a label below; the active tab puts the icon in a pill of `accent-subtle` and uses the accent colour and a heavier stroke. Desktop uses the top bar and, for staff, the sidebar rail.
- Page headers on phone use a **large title** that collapses to a 44 px bar on scroll.
- Top-bar links are 40 px pills with 4 px between them and 32 px between the logo and the links; the current page gets an `accent-subtle` tint. The right side holds the appearance menu (a round icon button that opens a small popover) and, from tablet up, a tonal Sign in button.
- Navigation is at most two levels deep. No menu holds more than five items.
- Secondary tasks open as **bottom sheets** with a grabber: filters, date and time pickers, currency, quote breakdown. Destructive confirmations use an action sheet.
- Settings, bookings, and documents use **inset grouped lists** (rounded group, hairline separators, chevron) in place of stacked cards. Operator inbox rows support swipe actions.

## 11. Mobile patterns

- **Vehicle page and checkout:** a sticky bar above the tab bar and safe area carries the total and one button. Checkout is one step per screen with a progress indicator and a summary row.
- **Operator schedule:** a day view with a horizontal week strip on phone; the Gantt-style grid is for tablet and up. The inbox is a list with swipe accept and decline and a visible response timer.
- **Forms:** label above the field, 48 px inputs, 16 px text, the right keyboard type (`tel`, `email`, numeric).
- **Weak data:** skeletons with fixed dimensions (no layout shift), images with set aspect ratios, and no content hidden behind scripts that fail offline.

## 12. Writing and content tokens

- Currency is the code then the amount with a thousands separator: "KES 12,500", "USD 95". Customers default to KES in Kenya and USD elsewhere, and can switch. A converted amount also states the charge currency and the rate date. Staff screens and documents show KES. Only `Price` formats money.
- Dates: "Tue 10 Nov" on screens, full date in documents. Times follow the device's 12- or 24-hour setting, always in Africa/Nairobi.
- Button labels are verbs: "Get quote", "Request booking", "Upload licence".
- Plain, welcoming English. No VIP, diplomatic, or armed-escort wording (owner positioning, 23 November 2026).

## 13. Design goals

| Goal         | How                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Simple       | One primary action per screen, no more than five choices at once.                                                         |
| Direct       | Labels say what happens. No icon-only key actions.                                                                        |
| Familiar     | Tab bar, vehicle cards, sticky price bar, standard pickers, a clear back button.                                          |
| Distinctive  | The large, clean vehicle photograph leads each page, and the booking timeline shows the path from request to return.      |
| Easy to find | Search reachable from every screen; each page has one obvious next step.                                                  |

The app keeps people by being useful: saved vehicles, a trip checklist, booking history and receipts, and help on the page where a question arises. No fake scarcity, no countdowns without a real hold, no notifications built to pull people back. Checks before development: five test users on a mid-range Android phone complete three tasks (find a class, quote a set date, find the booking timeline) in under three minutes, and any screen where someone hesitates over five seconds is fixed first.

## 14. Changes from the Stitch designs

| Stitch                                                         | Here                                                          | Why                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| 40+ Material role names                                        | About 18 meaning-based tokens                                 | Half the roles were unused                       |
| Navy #082F6A and cobalt #0159C5 button states                  | One `accent` and `accent-pressed`                             | One action colour                                |
| No dark palette                                                | Full dark set                                                 | Apple expects both                               |
| Body 15 px, labels 11 px                                       | Body 16 px, floor 12 px                                       | iOS input zoom, legibility                       |
| Grey #727785 for all secondary text (about 4.3:1)              | `label-2` for reading, `label-3` only for placeholders        | Contrast                                         |
| Shield-container logo, two wordmarks, descriptor lines         | Open mark, one wordmark, descriptors in the footer            | Small-size legibility                            |
| Floating labels                                                | Label above the field                                         | Easier to read at small sizes                    |
| Top-tab operator console, desktop-first Gantt                  | Tab bar and day view on phone                                 | Mobile first                                     |
| Material Symbols                                               | Lucide, 1.5 px                                                | One outline set                                  |
| White text on #25D366                                          | Ink text on #25D366                                           | White fails contrast                             |

## 15. Governance and open decisions

- Tokens are defined once in `styles/tokens`, built from `brand.js`, and mapped to Tailwind names in one table. A lint rule bans raw hex and arbitrary colour or size classes outside `styles/tokens` and `brand.js`.
- A token change is reviewed against both themes and the contrast check. New tokens and components arrive with an update to this document and the component library.
- Open: the logo drawing (the mark is specified, the SVG is a Phase 0 deliverable); a second brand colour for corporate pages, deferred with B2B.

## Working screens: operator console and admin

Owner request, 25 November 2026: follow the Stitch operator screens (fleet, bookings, admin review queue, component sheet). Nunito Sans stays (the ruling of 23 November 2026), where the Stitch file names Inter.

| Part | Rule |
| --- | --- |
| Type | The one ramp above. Working screens add names by job (`page`, `section`, `metric`, `cell`, `meta`) at the same sizes. |
| Frame | `ConsoleShell`: from tablet up a sidebar (logo, area, who is signed in, every page under its group with its own icon, website link, sign out, appearance). Phones keep a slim top bar and the four-item tab bar; More lists the same groups. Pressing a page changes colour only: no movement between pages. |
| Page | `PageHeader`: uppercase label, title, one line, actions. |
| Motion | Figures, the phone menu, and the renter's dashboard arrive 40 ms apart (`stagger`), once per visit to the page. Reduced motion shows them at once. |
| Figures | `StatCard`: label, icon tile, number, share bar, context. `warm` when someone is waiting; one `strong` navy card per row. |
| Lists | `DataTable` inside a card: uppercase header row, status pills with a dot, cards on phones. `ResourceTable` adds search, filter pills, and a drawer to add or edit. |

Left out on purpose, because no data stands behind them: telematics and maps, escrow and revenue figures, chauffeur vetting, and countdown request cards.

## Plain pages and scalable sizes (owner, 25 November 2026)

Public pages follow the restraint of Apple and Google product pages. This replaces the layering, eyebrow-label, and icon-tile lines in section 2.

| Part | Rule |
| --- | --- |
| Cards | Only for a thing someone can pick or act on: a car, the search, a price. Everything else is grouped by space and a hairline (`RuledItem`). |
| Headings | One `SectionHeading` per section: 20 px on phones, 28 px from tablet up. Card and item titles stay smaller. No label above a title. |
| Decoration | No icon tiles, arrows on links, hover lifts, or fade-in on scroll. The hero keeps its badge and the logo's arc and pulsing arrival dot (`ArcBackdrop`), at the owner's request. |
| Colour | The navy panels keep the brand gradient (navy, primary, accent). |
| Words | A title says what the section is. A fact is stated once on a screen where possible. |
| Units | Spacing, control heights, and radius are in `rem`; breakpoints are in `em`; hairlines and shadows stay in px; touch targets are `max(44px, 2.75rem)`; phone side margins (`gutter`) stop growing with the text. |
| Large text | Check every public page at 375 px with text at 200%: nothing scrolls sideways. |

## Choosing and deciding (owner, 25 November 2026)

| Principle | Rule |
| --- | --- |
| Choice overload | At most five links in a named group, about seven choices in one view. A home section offers one way into each item. |
| Cognitive load | Familiar layouts. A fact is not repeated on the same screen. Ask only for what the next step needs. |
| Stand-out | One filled button per view, for the main action. Buttons repeated down a list are tonal. |
| Trust | Only true signals: "Approved company" on a listed car (an admin reviewed it). No ratings, counts, or logos we cannot show evidence for. |
| Serial position | The most used item comes first, the next most memorable last, in menus and question lists. |
| Grouping | Related things sit closer than unrelated ones; like things look alike. |

The appearance switch sits in the footer and in Settings, not in the public header (this replaces the header line in section 10).

