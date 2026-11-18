# Design System Specification

**Purpose:** Keeps the interface consistent. Defines the tokens (colour, type, spacing, radius, motion, elevation), the rules for using them, and the accessibility baseline. Components are specified in the UI component library document. Visual direction follows Apple's principles of clarity, deference, and depth (pack, section 3).

## 1. Principles

1. Tokens are the only source of values. No raw hex codes, pixel values, or font sizes in components.
2. Light and dark themes share one token set.
3. Mobile first; breakpoints added upward.
4. Accessibility is part of the spec, not a later check.
5. A new token is added only when an existing one cannot express the need.

## 2. Colour

| Token                  | Light                                                             | Dark                                                                                                  | Use                                  |
| ---------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `color.bg.base`        | #FFFFFF                                                           | #000000                                                                                               | Page background                      |
| `color.bg.raised`      | #F5F5F7                                                           | #1C1C1E                                                                                               | Cards, grouped lists                 |
| `color.bg.overlay`     | rgba(255,255,255,0.8) with blur                                   | rgba(28,28,30,0.8) with blur                                                                          | Sheets, sticky bars                  |
| `color.text.primary`   | #1D1D1F                                                           | #F5F5F7                                                                                               | Body and headings                    |
| `color.text.secondary` | #6E6E73                                                           | #98989D                                                                                               | Supporting text                      |
| `color.text.inverse`   | #FFFFFF                                                           | #000000                                                                                               | Text on accent                       |
| `color.accent.default` | `brand.accent` from `config/brand.js` (default #0A5CC8, option A) | `brand.accentDark` from `config/brand.js`, set explicitly and contrast-checked on #000000 and #1C1C1E | Primary actions, links, active state |
| `color.accent.pressed` | Accent darkened 10 percent                                        | Accent lightened 10 percent                                                                           | Pressed state                        |
| `color.accent.subtle`  | Accent at 12 percent over `bg.base`                               | Accent at 20 percent over `bg.base`                                                                   | Selected rows, selected badges       |
| `color.accent.focus`   | Accent                                                            | Accent                                                                                                | Focus ring colour                    |
| `color.bg.skeleton`    | #E5E5EA                                                           | #2C2C2E                                                                                               | Loading placeholders                 |
| `color.border.subtle`  | #D2D2D7                                                           | #3A3A3C                                                                                               | Dividers                             |
| `color.status.success` | #248A3D                                                           | #32D74B                                                                                               | Confirmed, verified                  |
| `color.status.warning` | #B25000                                                           | #FF9F0A                                                                                               | Pending, attention                   |
| `color.status.error`   | #D70015                                                           | #FF453A                                                                                               | Errors, rejected                     |
| `color.status.info`    | #0066CC                                                           | #0A84FF                                                                                               | Information                          |

**Status backgrounds.** Each status colour has a matching `color.status.*.bg` token for badges and alerts: the status colour at 12 percent over `bg.base` in light mode and 20 percent in dark mode. The status text token must pass 4.5 to 1 on its own background token; check both themes.

**Brand source.** Brand name and colours are defined once in `config/brand.js`. `styles/tokens` and the Tailwind configuration read from it. No component contains a brand name or colour.

Contrast: all text tokens meet WCAG 2.1 AA (4.5 to 1 for body text, 3 to 1 for large text) against their background. Verified in the design file before development.

## 3. Typography

Font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. Display sizes use the display variant where the platform provides one.

| Token           | Size  | Line height | Weight | Use                                            |
| --------------- | ----- | ----------- | ------ | ---------------------------------------------- |
| `type.display`  | 34 px | 41 px       | 700    | Hero headline                                  |
| `type.title1`   | 28 px | 34 px       | 700    | Page title                                     |
| `type.title2`   | 22 px | 28 px       | 600    | Section heading                                |
| `type.title3`   | 20 px | 25 px       | 600    | Card title                                     |
| `type.body`     | 17 px | 22 px       | 400    | Body text (minimum on customer screens: 16 px) |
| `type.callout`  | 16 px | 21 px       | 400    | Form labels, helper text                       |
| `type.subhead`  | 15 px | 20 px       | 400    | Secondary text                                 |
| `type.footnote` | 13 px | 18 px       | 400    | Captions, legal text                           |
| `type.caption`  | 12 px | 16 px       | 500    | Labels, badges                                 |

Staff desktop density tokens, as set in the pack, section 4:

| Token                | Size            | Line height | Weight | Use                         |
| -------------------- | --------------- | ----------- | ------ | --------------------------- |
| `type.staff.label`   | 14 px           | 20 px       | 400    | Staff labels and table text |
| `type.staff.heading` | 12 px uppercase | 16 px       | 600    | Staff section headings      |

On customer screens the text never goes below 16 px (`type.callout`).

## 4. Spacing, radius, and elevation

- Spacing scale on an 8 px grid: `space.1` 4, `space.2` 8, `space.3` 12, `space.4` 16, `space.5` 24, `space.6` 32, `space.7` 48, `space.8` 64.
- Sizes: `size.touch` 44 px (minimum touch target on customer screens); `size.row` 32 px (staff desktop rows).
- Radius: `radius.control` 8 px (buttons, inputs); `radius.card` 12 px; `radius.sheet` 16 px at the top corners; `radius.pill` 999 px for badges.
- Elevation: `elevation.1` soft shadow for cards (light `0 1px 3px rgba(0,0,0,0.08)`, dark `0 1px 3px rgba(0,0,0,0.4)`); `elevation.2` for floating bars and sheets (light `0 8px 24px rgba(0,0,0,0.12)`, dark `0 8px 24px rgba(0,0,0,0.5)`). Shadows are subtle; hierarchy comes mostly from background tone.
- Layers: `z.header` 100, `z.stickyBar` 200, `z.sheet` 300, `z.dialog` 400, `z.toast` 500. No component sets a z-index outside this scale.

## 5. Motion

| Token             | Duration | Easing      | Use                              |
| ----------------- | -------- | ----------- | -------------------------------- |
| `motion.fast`     | 150 ms   | ease-out    | Hover, press, toggles            |
| `motion.standard` | 250 ms   | ease-in-out | Sheets, panels, page transitions |
| `motion.slow`     | 400 ms   | ease-in-out | Large layout changes only        |

With reduced motion enabled, transitions become fades or instant changes. No motion repeats or loops except loading indicators.

## 6. Iconography

- One line icon set: Lucide (ISC licence, bundled with shadcn/ui), stroke width set to 1.5 px, 24 px grid, 20 px rendered size in controls. SF Symbols are not used on the web.
- Icons never stand alone for key actions; they sit beside a label.
- Status uses an icon and a word together.

## 7. Breakpoints

| Token        | Width          | Target                                  |
| ------------ | -------------- | --------------------------------------- |
| `bp.phone`   | 0 to 767 px    | Default styles                          |
| `bp.tablet`  | 768 px and up  | Two-column layouts; staff rail appears  |
| `bp.desktop` | 1024 px and up | Full staff sidebar; wider content width |
| `bp.wide`    | 1440 px and up | Maximum content width 1200 px           |

Tailwind mapping: `md` is 768 px, `lg` is 1024 px, and `wide` (1440 px) is added as a custom screen. Styles are written for the phone first and extended upward.

## 8. Focus, states, and interaction

- Focus ring: 2 px accent outline with 2 px offset, always visible on keyboard focus.
- Every interactive component defines: default, hover (pointer only), pressed, focus, disabled, loading, error.
- Disabled controls keep their label and show the reason nearby.
- Touch targets never overlap; spacing between targets at least 8 px.

## 9. Navigation patterns

- Links navigate and change the URL. Buttons toggle state and do not change the URL.
- Active navigation items show two signals: a 2 px accent bar on the leading edge and a bold label. Fill alone is not used.
- Navigation is at most two levels deep. Sub-items are indented under the parent label.

## 10. Writing and content tokens

- Currency is shown as the code followed by the amount with a thousands separator: "KES 12,500", "USD 95". Customers default to KES in Kenya and USD elsewhere, and can switch. When an amount is converted, the screen also states the charge currency and the rate date. Staff screens and documents always show KES. Only the `Price` component formats money.
- Dates: "Tue 10 Nov" on screens; full date in documents.
- Times: 24-hour or 12-hour as set by the device, always in Africa/Nairobi.
- Button labels are verbs: "Get quote", "Pay deposit", "Upload licence".

## 11. Governance

- Tokens are defined once in `styles/tokens`, built from `config/brand.js`, and exported to the design file. The Tailwind configuration maps each token name (for example `color.bg.base`) to a utility name (`bg-base`) in one table.
- A lint rule bans raw hex values and arbitrary colour or size classes outside `config/` and `styles/tokens`.
- A change to a token is reviewed against both themes and the contrast check.
- New components and tokens are added through a pull request that updates this document and the component library.

## Design direction: Apple HIG with selected Material 3 ideas (15 November 2026)

Apple's Human Interface Guidelines remain the base: clarity, deference, depth, system typography, generous spacing, bottom sheets, and calm motion. The owner asked to add selected ideas from Google's Material Design 3 for character. Adopt only the ideas below. Anything else from Material 3 is not used, so the product reads as one system.

| Material 3 idea             | How it is used here                                                                                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tonal surfaces              | `accent.subtle` and `bg.raised` tint selected cards, chips, and active items                                                                                         |
| State layers                | Hover and pressed states are a translucent overlay of the control's colour (hover 8 percent, pressed 12 percent), not a new colour per state                         |
| Filled tonal button         | A fifth `Button` variant, `tonal`: `accent.subtle` background with accent text, for secondary actions beside a primary                                               |
| Chips and segmented choices | Guided choice answers and filters use chips; short exclusive sets (passengers, handover type) use a segmented control                                                |
| Pill active indicator       | The active item in `BottomBar` and `SidebarRail` gets a pill-shaped `accent.subtle` indicator, together with the bold label and the 2 px accent bar already required |
| Emphasised easing           | `motion.standard` may use a decelerate curve (`cubic-bezier(0.2, 0, 0, 1)`) for sheets and panels                                                                    |

**Not used from Material 3:** ripples, floating action buttons, dynamic colour from the user's wallpaper, tint-based elevation, and its type scale. Typography stays on the system font stack.

**Rules**

- The accent still comes from `config/brand.js`; tonal colours derive from it, not from a Material palette.
- Contrast checks apply to every tonal pairing in both themes.
- The accessibility rules in section 8 and section 9 are unchanged: a state or active item never relies on fill alone.

## 12. Open decisions

1. Brand accent colour and logo. Option A (#0A5CC8) is the default until the owner chooses.
2. Whether the company wants a second brand colour for corporate pages.

## Design Brief (15 November 2026)

The product should feel simple, direct, and recognisable, with one distinctive element. A first-time customer should understand each screen within a few seconds and complete a quote without help. Mobile comes first.

**Five design goals**

| Goal         | How it is achieved                                                                                                                                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Simple       | One primary action per screen. No more than five choices on one screen. Other options sit behind a "More" or a sheet.                                                                                                                         |
| Direct       | Labels say what happens: "Get quote", "Pay deposit", "Upload licence". No icon-only actions on key steps.                                                                                                                                     |
| Familiar     | Patterns people already know from banking and ride apps: bottom tab bar, cards for vehicles, a sticky price bar, standard date pickers, and a clear back button.                                                                              |
| Distinctive  | One signature element: the vehicle photograph, large and clean, leads each class and vehicle page. The booking timeline is the second: a visible path from quote to return. Everything else stays quiet, following the Apple-inspired system. |
| Easy to find | A bottom bar of three to four items on phones, always in the same place. Search is reachable from every screen. Each page has one obvious next step.                                                                                          |

**Helping people stay, honestly**

The app keeps people because it is useful, not because it creates pressure. These features give a reason to return:

- Saved vehicles and recent searches.
- A trip checklist for each booking: documents, pickup time, and what to bring.
- Booking history and receipts in one place.
- Help on the page where a question arises, so people don't leave to search elsewhere.

We do not use countdown timers that do not reflect a real hold, fake scarcity, or notifications designed to pull people back. Any urgency shown must match a real deadline, such as the 30-minute deposit hold.

**Checks before development**

- Five test users, on a mid-range Android phone, complete three tasks: find a class, get a quote for a set date, and find the booking timeline. Target: all five finish, with no help, in under 3 minutes.
- Mark any screen where a user hesitates for more than 5 seconds. Fix before building the next screen.
- Track first-try success on the quote flow in the pilot, and set a target after the first 50 quotes.

**Mobile first, in practice**

Every screen is designed at 360 px width first. The layout is one column, with the primary action in the lower part of the screen, within thumb reach. Desktop adds space and a side panel only where it helps staff work faster.
