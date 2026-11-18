# Design System Audit and Extensions

**Scope:** `design-system.md` (tokens) and `ui-component-library.md` (42 components), checked against the product pack §23 and §24, the UX spec, the IA, the analytics doc, and the root `CLAUDE.md` rules. No code exists yet, so token coverage is checked on the specifications, not on source files.

**Status:** Applied on 15 November 2026 to `design-system.md` and `ui-component-library.md`. Storybook versus the internal `/dev/components` page, and the currency selector placement, are recorded there as working assumptions pending the owner.

## 1. Summary

**Components reviewed:** 42 | **Issues found:** 19 | **Spec score:** 68/100 (judgement, see section 3)

The tokens are sound: contrast is checked, the scale is on an 8 px grid, and light and dark share one set. The weak spots are three. Money components are KES-only, which §24.1 breaks. Most components list props but not states or accessibility names. About fifteen components that other documents depend on are missing.

Contrast spot checks (calculated, WCAG relative luminance): accent #0A5CC8 on white 6.2:1; secondary text #6E6E73 on white 5.1:1 and on `bg.raised` 4.7:1; warning #B25000 on `bg.raised` 4.8:1. All pass AA for body text.

## 2. Token audit

| Area          | Finding                                                                            | Recommendation                                                                                                                                |
| ------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand source  | Accent is "to confirm" in the design system; the root rules require one brand file | Define `config/brand.js` (name, accent, accent dark). `styles/tokens` and the Tailwind config both read it. Default accent #0A5CC8 (option A) |
| Accent family | Only `accent.default` and `accent.pressed` exist                                   | Add `accent.subtle` (tint for selected rows and badges) and `accent.focus`                                                                    |
| Status tints  | Status colours are text colours only; badges and alerts need a background          | Add `status.*.bg` tokens per theme, contrast-checked against the text token                                                                   |
| Dark accent   | "Brand colour, lightened" has no value                                             | Set one explicit dark value in `brand.js` and check contrast on #000 and #1C1C1E                                                              |
| Body size     | `type.body` is 17 px; the pack says 16 px minimum on customer screens              | Keep 17 px as the token; 16 px (`callout`) is the floor, never lower                                                                          |
| Staff density | 14 px labels and 12 px uppercase headings are prose, not tokens                    | Add `type.staff.label` and `type.staff.heading`                                                                                               |
| Touch targets | 44 px and 32 px are prose                                                          | Add `size.touch` (44) and `size.row` (32)                                                                                                     |
| Elevation     | `elevation.1` and `.2` are named without values                                    | Define shadow values per theme                                                                                                                |
| Z-index       | No scale for header, sticky bar, sheet, dialog, toast                              | Add `z.header`, `z.stickyBar`, `z.sheet`, `z.dialog`, `z.toast`                                                                               |
| Skeleton      | No loading colour                                                                  | Add `color.bg.skeleton`                                                                                                                       |
| Breakpoints   | `bp.wide` 1440 is not a Tailwind default                                           | Extend the Tailwind screens: `md` 768, `lg` 1024, `wide` 1440                                                                                 |
| Icons         | "Open-licensed line set" not named                                                 | Use Lucide (ISC licence, ships with shadcn/ui), stroke width set to 1.5 to match the spec                                                     |
| Token names   | Dots in the spec (`color.bg.base`)                                                 | Map to Tailwind names (`bg-base`, `text-primary`) in one table inside the config; the spec names stay the reference                           |

## 3. Component completeness

Scoring: states defined, variants defined, props typed, accessibility name stated, uses tokens only. Judged from the specification.

| Group      | Components | States  | Variants | Accessibility | Notes                                                                                  |
| ---------- | ---------- | ------- | -------- | ------------- | -------------------------------------------------------------------------------------- |
| Actions    | 5          | Good    | Good     | Partial       | `Button` is the only fully specified one                                               |
| Inputs     | 8          | Missing | n/a      | Partial       | No error, disabled or loading states listed; `Checkbox` and `RadioGroup` share one row |
| Cards      | 7          | Missing | Partial  | Missing       | No loading skeleton or unavailable state for `VehicleCard`                             |
| Status     | 7          | Partial | Good     | Partial       | `StatusBadge` does not cover all nine booking statuses                                 |
| Layout     | 9          | Partial | Good     | Partial       | `Dialog` and `Sheet` lack focus-trap and escape rules                                  |
| Staff data | 5          | Missing | n/a      | Missing       | `DataTable` keyboard behaviour not defined                                             |
| Map        | 1          | Good    | n/a      | Good          | Meets the pack's accessibility rule                                                    |

## 4. Issues in the component library

| #   | Issue                                                                                                                                                               | Fix                                                                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `MoneyField`, `VehicleCard`, `StickyBookingBar`, `QuoteBreakdown` take KES only; §24.1 needs a location-based currency, a rate date, and a rate fixed at quote time | One `Price` component (section 6) renders every amount; other components pass it `kes` and never format money themselves                                                                        |
| 2   | `StatusBadge` variants (confirmed, pending, attention, cancelled, active, closed) do not match the nine statuses                                                    | Key it by status: quoted, pending_payment, confirmed, ready, active, returned, closed, cancelled, expired. Each maps to a label, an icon and a token (status must not rely on colour alone)     |
| 3   | `QuoteBreakdown` has no security-deposit line, no named discount line, no "Refundable deposit" label                                                                | Line kinds: `charge`, `discount`, `tax`, `refundable_deposit`, `security_deposit`. Discounts and the security deposit are visually separate from the rental total                               |
| 4   | `PhoneField` fixed to +254 by default; non-Kenyan customers default to USD                                                                                          | Country select with +254 as the default, normalised to E.164                                                                                                                                    |
| 5   | `CurrencySelector` is "display only"; §24.1 adds a location default and a remembered choice                                                                         | Default from the Cloudflare country header, stored on the device, KES and USD only; copy states the charge currency                                                                             |
| 6   | `className` for layout only, but shadcn primitives accept arbitrary classes                                                                                         | Wrap each primitive; the wrapper exposes `className` for layout and no colour or type props. Add a lint rule banning raw hex and arbitrary colour classes outside `config/` and `styles/tokens` |
| 7   | "Every component has a story" implies Storybook, a heavy dependency                                                                                                 | Open question 1 below                                                                                                                                                                           |
| 8   | `Header` and `BottomBar` do not cap item counts                                                                                                                     | Enforce the UX limits in props: customer bottom bar 3 items, staff 4; no menu over five items                                                                                                   |
| 9   | `VehicleCard` has `rating` but no rule for the 5-review threshold                                                                                                   | Card renders no rating below the threshold; the check lives in the service, not the component                                                                                                   |
| 10  | `ExtraRow` can be `selected` by default                                                                                                                             | Never pre-selected; the component has no default-checked prop (UX rule: no pre-ticked extras)                                                                                                   |
| 11  | `DateRangePicker` shows blocked dates but not the minimum hire or the 1-hour grace                                                                                  | Props for `minDays` and blocked ranges; no business numbers in the component                                                                                                                    |
| 12  | `Toast` duration prop                                                                                                                                               | Errors never auto-dismiss; toasts are for confirmations only                                                                                                                                    |

## 5. Extensions: new components

All follow the library rules: states, props, and accessibility name specified first.

| Component           | Needed by                             | Props                                                 | States                           | Accessibility and rules                                                                                                                                  |
| ------------------- | ------------------------------------- | ----------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Price`             | Every amount                          | `kes`, `displayCurrency`, `rate`, `rateDate`, `size`  | default, converted, loading      | Shows "KES 12,500"; when converted, adds the original and "Charged in KES" or the charge currency, plus the rate date. The only place that formats money |
| `GuidedChoice`      | Search (UX §Helping Customers Choose) | `questions[]` (passengers, purpose, days), `onAnswer` | unanswered, answered             | Three questions, tap answers, one decision per screen                                                                                                    |
| `RecommendedClass`  | Search results                        | `class`, `reason`                                     | default, accepted                | One sentence reason from seats, luggage and best-for tags; never a popularity claim without data                                                         |
| `CompareTable`      | Search results                        | `classes[]` (max 3)                                   | default                          | Hides identical rows; shows total price first, daily rate second                                                                                         |
| `HeroSearch`        | Homepage                              | `onSubmit`, `defaults`                                | default, error                   | Dates, location, class; one Get quote button                                                                                                             |
| `EnquiryForm`       | Vehicle page, guest flow (§24.6)      | `vehicle`, `dates`, `onSubmit`                        | default, submitting, sent, error | Name, phone, email; privacy notice linked; says no payment is taken online                                                                               |
| `SignaturePad`      | Agreement, handover                   | `onSign`, `onClear`                                   | empty, signed                    | Touch drawing plus a typed-name alternative for screen-reader users                                                                                      |
| `HandoverChecklist` | Staff handover                        | `fields` (fuel, mileage), `photos[]`, `onSave`        | draft, saved                     | Camera or upload; saves per step; append-only record                                                                                                     |
| `DocumentViewer`    | Staff review                          | `documentId`, `reason`                                | loading, ready, expired          | Requires a reason, fetches a 10-minute link, logs the view; never caches the file                                                                        |
| `ConsentBanner`     | Analytics (§20.7)                     | `onAccept`, `onDecline`                               | default                          | Declining is as easy as accepting; analytics stay off until accepted                                                                                     |
| `LanguageSwitcher`  | Header, later languages               | `locales[]`, `value`                                  | default                          | Hidden while English is the only locale                                                                                                                  |
| `FaqAccordion`      | FAQ, vehicle pages                    | `items[]`                                             | collapsed, expanded              | Emits FAQ structured data from the same items                                                                                                            |
| `Breadcrumb`        | All pages below home                  | `items[]`                                             | default                          | Emits breadcrumb structured data                                                                                                                         |
| `WhatsAppButton`    | Contact, error states                 | `number`, `message`                                   | default                          | Visible label, not icon only; opens a prefilled chat                                                                                                     |
| `RefundSummary`     | Cancellation                          | `refundKes`, `window`, `acknowledge`                  | default, no-refund               | Shows the refund before confirming; requires a tick inside the no-refund window                                                                          |

## 6. Open questions

1. **Storybook or a simple page.** Recommended: an internal `/dev/components` route excluded from the production build, to avoid a heavy dependency. Owner to decide.
2. **Currency selector placement.** Recommended: header on all public pages, since overseas visitors see USD by default.
3. **Brand colour.** Option A (#0A5CC8) remains the default until the owner chooses; the logo file is still outstanding.

## 7. Priority actions

1. Create `config/brand.js` and the token build, with the additions in section 2.
2. Build `Price`, then migrate every money component to it.
3. Fix `StatusBadge` and `QuoteBreakdown` before any booking screens.
4. Add the lint rule that bans raw colours and arbitrary values outside the token files.
5. Specify states and accessibility names for the inputs and cards groups before building them.
