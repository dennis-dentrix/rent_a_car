# UI Component Library

**Purpose:** Defines each reusable component: its purpose, variants, props, states, and where it is used. Components are built with the tokens in the Design System Specification. Each component is built once, in `components/`, and reused everywhere (DRY rule, pack section 14). Token names and patterns come from `design-system.md`.

## 1. Foundations

- Built with React and Tailwind; primitives from shadcn/ui, restyled with tokens.
- Each shadcn primitive is wrapped. The wrapper exposes `className` for layout only, with no colour or type props. A lint rule bans raw hex and arbitrary colour or size classes outside `config/` and `styles/tokens`.
- Every component supports keyboard use, visible focus, and a label or accessible name.
- Every component defines its states: default, hover (pointer only), pressed, focus, disabled, loading, and error where it applies.
- Components never format money. Every amount renders through `Price` (section 4).
- Components hold no business numbers (minimum hire, grace period, review threshold). Services supply them as props.
- Every component is shown in all states on an internal `/dev/components` page, excluded from the production build, and reviewed on phone and desktop (see open question 1).

## 2. Actions

| Component          | Variants                                         | Props                                                                | States                                            | Used on                                |
| ------------------ | ------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------- |
| `Button`           | primary, tonal, plain, destructive               | `size` (md 48 px, sm 36 px on staff), `icon`, `loading`, `fullWidth` | default, hover, pressed, focus, disabled, loading | Everywhere                             |
| `LinkButton`       | default, subtle                                  | `href`                                                               | default, hover, focus, visited                    | Navigation to other pages              |
| `StickyBookingBar` | single                                           | `price` (a `Price` input), `ctaLabel`, `onAction`                    | default, disabled (no class selected)             | Vehicle and quote screens on phone     |
| `IconButton`       | default, subtle                                  | `label` (required for screen readers), `icon`                        | default, pressed, focus, disabled                 | Toolbars, staff rows                   |
| `Toggle`           | switch                                           | `checked`, `label`, `onChange`                                       | off, on, focus, disabled                          | Settings, currency selector preference |
| `WhatsAppButton`   | default                                          | `number`, `message`                                                  | default, focus                                    | Contact page, error states             |

`WhatsAppButton` always shows a text label, never an icon alone. It opens a chat with the message prefilled.

## 3. Inputs

| Component          | Props                                                             | Notes                                                                                                                    |
| ------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `TextField`        | `label`, `helper`, `error`, `type` (text, email, tel)             | Label always visible; error text linked by `aria-describedby`                                                            |
| `MoneyField`       | `valueKes`, `onChange`                                            | Staff use only. Numeric keypad on phones; formats as KES                                                                 |
| `PhoneField`       | `value`, `countryCode` (default +254, selectable)                 | Accepts Kenyan and international formats; normalises to E.164                                                            |
| `DateRangePicker`  | `start`, `end`, `minDate`, `blockedRanges`, `onChange` | Touch-first calendar; keyboard arrows on desktop; blocked dates shown. The service supplies the minimum date and blocked ranges; the minimum-hire rule is shown as helper text on the screen |
| `Select`           | `options`, `value`, `label`                                       | Bottom sheet on phone, menu on desktop. No more than five items before filtering                                         |
| `Chip`             | `label`, `selected`, `onToggle`                                   | Filters and guided-choice answers; selected state uses `accent.subtle` plus a check icon                                 |
| `SegmentedControl` | `options` (2 to 4), `value`, `onChange`, `label`                  | Short exclusive choices such as passengers or office versus delivery                                                     |
| `Checkbox`         | `label`, `checked`, `onChange`                                    | Never checked by default for extras or insurance                                                                         |
| `RadioGroup`       | `label`, `options`, `value`                                       | Group label required                                                                                                     |
| `FileUpload`       | `accept`, `maxSizeMb` (10), `onUpload`                            | Shows progress and rejection reason                                                                                      |
| `SearchField`      | `placeholder`, `onSubmit`                                         | Used in the staff search box                                                                                             |
| `HeroSearch`       | `onSubmit`, `defaults`                                            | Dates, location, class; one Get quote button. States: default, error                                                     |
| `GuidedChoice`     | `questions[]` (passengers, purpose, days), `onAnswer`             | Three tap-able questions, one decision per screen. States: unanswered, answered                                          |
| `EnquiryForm`      | `vehicle`, `dates`, `onSubmit`                                    | Name, phone, email; privacy notice linked; says no payment is taken online. States: default, submitting, sent, error     |
| `SignaturePad`     | `onSign`, `onClear`                                               | Touch drawing plus a typed-name alternative for screen-reader users. States: empty, signed                               |

All inputs also define error, disabled, and focus states.

## 4. Selection and cards

| Component          | Variants                    | Props                                                                                                                         | Used on                               |
| ------------------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `Price`            | default, converted, loading | `kes`, `displayCurrency`, `rate`, `rateDate`, `size`                                                                          | Every amount                          |
| `VehicleCard`      | compact, full               | `image`, `name`, `classLabel`, `price`, `availabilityCount`, `rating` (omitted until the review threshold is met), `onSelect` | Homepage, class pages, search results |
| `ClassSummary`     | default                     | `name`, `seats`, `bestFor`, `price`                                                                                           | Class pages, quote                    |
| `RecommendedClass` | default, accepted           | `class`, `reason`                                                                                                             | Search results                        |
| `CompareTable`     | default                     | `classes[]` (maximum 3)                                                                                                       | Search results                        |
| `ExtraRow`         | default, selected           | `name`, `price`, `checked`, `onToggle`                                                                                        | Quote                                 |
| `QuoteBreakdown`   | default                     | `lines[]` (kind: charge, discount, tax, refundable_deposit, security_deposit), `total`                                        | Quote, booking confirmation           |
| `RefundSummary`    | default, no-refund          | `refundKes`, `window`, `acknowledge`                                                                                          | Cancellation                          |
| `LocationCard`     | default                     | `name`, `address`, `hours`, `directionsUrl`                                                                                   | Locations, contact                    |
| `ReviewCard`       | default                     | `rating`, `text`, `date`, `verifiedBooking`                                                                                   | Reviews                               |
| `FeatureList`      | default                     | `items[]` with optional icon                                                                                                  | Vehicle page, why choose us           |

**Rules**

- `Price` is the only component that formats money. It shows "KES 12,500". When converted it also shows the original amount, the charge currency, and the rate date. Staff screens and documents pass KES only.
- `ExtraRow` has no default-checked prop. Extras are never pre-selected.
- `QuoteBreakdown` shows discounts as named lines. The refundable deposit is labelled "Refundable deposit" and the security deposit is its own line, shown apart from the rental total.
- `RecommendedClass` gives one sentence of reason from seats, luggage, and best-for tags. It makes no popularity claim without data. `CompareTable` hides identical rows and shows the total price before the daily rate.
- `RefundSummary` shows the refund before the customer confirms, and requires a tick inside the no-refund window.
- The service decides whether a rating exists. `VehicleCard` shows none below the threshold.

## 5. Status and feedback

| Component       | Variants                                                                                | Props                                                             | Used on                                           |
| --------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------- |
| `StatusBadge`   | quoted, pending_payment, confirmed, ready, active, returned, closed, cancelled, expired | `status` (maps to a label, an icon, and a colour token)           | Booking lists, inbox                              |
| `Timeline`      | default, compact                                                                        | `steps[]` with `label`, `state` (done, current, upcoming), `date` | Booking detail and confirmation                   |
| `Alert`         | info, success, warning, error                                                           | `title`, `message`, `action`                                      | Forms, pages                                      |
| `Toast`         | default                                                                                 | `message`, `duration`                                             | Confirmations after an action only                |
| `Skeleton`      | line, block, card                                                                       | `width`, `height`                                                 | Loading states                                    |
| `EmptyState`    | default                                                                                 | `title`, `message`, `action`                                      | Lists with no results                             |
| `ProgressSteps` | default                                                                                 | `steps`, `current`                                                | Booking flow header                               |
| `ConsentBanner` | default                                                                                 | `onAccept`, `onDecline`                                           | First visit, where the privacy notice requires it |

**Rules**

- `StatusBadge` always shows an icon and a word, never colour alone.
- Errors never use `Toast`; they use `Alert`, which does not auto-dismiss.
- `ConsentBanner`: declining is as easy as accepting, and analytics stay off until the visitor accepts.

## 6. Layout and navigation

| Component          | Variants                        | Props                                                                         | Used on                                                           |
| ------------------ | ------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `Header`           | public, account, company, staff | `nav`, `currencySelector`, `languageSwitcher` (both optional). Page titles use `LargeTitle` (the collapse on scroll is not built yet) | Every page                                  |
| `Logo`             | mark, wordmark, tile            | `variant`, `size`                                                             | Header (mark and word), footer (with descriptor), app icon        |
| `InsetList`        | default                         | `items[]` with `title`, `detail`, `href` or `onSelect`, `trailing` (swipe actions arrive with the operator inbox, Phase 4)       | Settings, bookings, documents, operator inbox                     |
| `ActionSheet`      | default                         | `title`, `actions[]` (one destructive allowed), `onCancel`                    | Confirm cancel, delete, decline                                   |
| `Menu`             | default                         | `label`, `triggerIcon`, `items[]` (`label`, `icon`, `isSelected`, `onSelect`) | Appearance switch; closes on Escape, outside tap, or choice       |
| `IconButton`       | default                         | `label` (required)                                                            | Round 40 px icon control on a soft fill                           |
| `ThemeToggle`      | default                         | none (reads and saves the choice on the device)                               | Header and console rail; a `Menu` with Light, Dark, System        |
| `CurrencySelector` | default                         | `currencies` (KES, USD), `value`, `onChange`                                  | Header on all public pages, when enabled                          |
| `LanguageSwitcher` | default                         | `locales[]`, `value`                                                          | Header; hidden while English is the only locale                   |
| `BottomBar`        | customer, staff                 | `items[]` (customer 3, staff 4), `activeId` (shows accent bar and bold label) | Phone                                                             |
| `SidebarRail`      | rail, expanded                  | `items[]` (two levels), `collapsed`, `activeId`                               | Staff desktop                                                     |
| `Sheet`            | bottom (phone, with grabber, radius 20), centred dialog (desktop) | `open`, `title`, `onClose`, `detents` (half, full)           | Filters, pickers, currency, quote breakdown                       |
| `Dialog`           | default                         | `title`, `description`, `actions`                                             | Confirmations of irreversible actions                             |
| `Section`          | default                         | `title`, `children`                                                           | Page structure                                                    |
| `Container`        | default, narrow, wide           | `size`                                                                        | All pages                                                         |
| `Footer`           | default                         | `links[]`, `contact`                                                          | Public pages                                                      |
| `Breadcrumb`       | default                         | `items[]`                                                                     | Every page below the homepage; also emits structured data         |
| `FaqAccordion`     | default                         | `items[]`                                                                     | FAQ, vehicle pages; emits FAQ structured data from the same items |

**Rules**

- `CurrencySelector` defaults from the visitor's country (KES in Kenya, USD elsewhere), stores the choice on the device, and changes display only unless the booking says the charge currency differs. The component states the charge currency next to a converted price.
- `Sheet` and `Dialog` trap focus, close on Escape, and return focus to the control that opened them.
- No menu holds more than five items; longer lists are filtered first.

## 7. Data display (staff)

| Component           | Props                                          | Notes                                                                                                                  |
| ------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `DataTable`         | `columns`, `rows`, `getRowId`, `getRowHref`    | 32 px rows on desktop; card list on phone; a row is a link, so Enter opens it and the URL changes                                  |
| `KpiCard`           | `label`, `value`, `change`, `period`           | Dashboard home                                                                                                         |
| `ActivityFeed`      | `items[]` with `time`, `text`, `link`          | Dashboard home                                                                                                         |
| `CalendarGrid`      | `days`, `vehicles`, `bookings`                 | Fleet calendar; horizontal scroll on phone                                                                             |
| `Pagination`        | `cursor`, `hasNext`, `onNext`                  | Cursor-based, per the API spec                                                                                         |
| `HandoverChecklist` | `fields` (fuel, mileage), `photos[]`, `onSave` | Staff handover. Saves per step; the record is append-only. States: draft, saved                                        |
| `DocumentViewer`    | `documentId`, `reason`                         | Requires a reason, fetches a 10-minute link, logs the view, and never caches the file. States: loading, ready, expired |

## 8. Map

| Component   | Props                                       | Notes                                                                   |
| ----------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| `OfficeMap` | `latitude`, `longitude`, `label`, `address` | Lazy loaded; address text always shown beside it; "Get directions" link |

## 9. Rules for adding a component

1. Check this list first. Extend an existing component before creating one.
2. Specify the states, props, and accessibility name before building.
3. Add the component here and in the design file in the same pull request.
4. Remove a component only after all its uses are replaced.

## 10. Open questions

1. Whether to use Storybook or the internal `/dev/components` page. Working assumption: the internal page, to avoid a heavy dependency.
2. Currency selector placement. Working assumption: the header on all public pages, since visitors abroad see USD by default.
