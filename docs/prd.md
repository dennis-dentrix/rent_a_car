# Product Requirements Document (PRD)

**Product:** Premium car hire and executive transport platform for Kenya **Status:** Draft for owner review **Purpose:** Defines what the product does, for whom, and how success is measured. The UX spec, IA, and technical documents follow from this one.

## 1. Problem

Good car hire companies in Kenya are hard to find. Customers discover them through social media or word of mouth, then confirm details by WhatsApp or phone and visit an office to sign. The company loses bookings to slow replies and to customers who cannot compare options online.

## 2. Product position

Kenya's executive car hire and transport service: rentals, chauffeur services, airport transfers, and corporate transport. Fleet marketplace services come later, only after demand is proven.

## 3. Goals

1. Booking conversion: visitors become quotes, and quotes become paid bookings.
2. Local search growth: the company is found for the places and services it serves.
3. Marketplace readiness: data, pricing, and payments support partner fleets later without a rewrite.

## 4. Users

| Persona            | Need                                                                  | Success looks like                               |
| ------------------ | --------------------------------------------------------------------- | ------------------------------------------------ |
| Executive customer | Reliable car and driver for days or airport transfers; pays by M-PESA | Quote in one screen; booking in under 15 minutes |
| Corporate admin    | Cars for staff; one monthly invoice; approvals                        | Books for several staff; receives one statement  |
| Front-desk staff   | Sees every booking; handles walk-ins and calls                        | One inbox for all channels                       |
| Operations manager | Assigns vehicles and drivers; plans deliveries                        | Daily delivery list from the system              |
| Owner              | Controls prices, policy, and reporting                                | Approves rates; reads monthly metrics            |

## 5. Scope

**MVP (roadmap phases 0 to 4)**

- Public site: homepage, vehicle classes, location and airport pages, service pages, FAQ, contact.
- Quote engine using the rate table. Display currency: KES, USD, or EUR. Charges are always in KES.
- Booking with deposit through Tingg (M-PESA, card, bank).
- Customer account, ID and licence upload, electronic or in-office agreement.
- Office pickup or home and office delivery with a time window.
- Staff workspace: booking inbox, fleet calendar, deliveries, customers, documents, reports.
- Email and SMS notifications; reminders 24 hours before pickup.
- Review requests after handover and return; reviews shown after five real reviews per class.
- Google Maps office location where relevant.
- Mobile-first design; desktop staff screens.

**Later (roadmap phases 5 to 7)**

- Corporate dashboard with approvals and budget controls.
- Referral programme, abandoned-quote reminders, seasonal offers.
- Rule-based vehicle recommendations.
- Partner fleet, then independent owner marketplace with payouts and escrow (legal review first).
- eTIMS tax receipts (room reserved; see section 15 of the pack).

**Out of scope for MVP:** native mobile apps, peer-to-peer listings, automated damage detection, Swahili interface, driver login, loyalty programme, 360-degree vehicle views.

## 6. Functional requirements

| ID    | Requirement                                                                                      | Priority |
| ----- | ------------------------------------------------------------------------------------------------ | -------- |
| FR-01 | Customers search by dates, location, and class; see live availability counts                     | Must     |
| FR-02 | A quote shows vehicle, extras, delivery, taxes, deposit, and total, all from the pricing service | Must     |
| FR-03 | A quote expires after a set time; expired quotes are re-priced                                   | Must     |
| FR-04 | Two bookings cannot overlap on the same vehicle                                                  | Must     |
| FR-05 | A deposit payment confirms a booking once, even when a webhook repeats                           | Must     |
| FR-06 | Customers upload ID and licence; staff approve or reject, with the reason recorded               | Must     |
| FR-07 | Booking status changes follow the transition table only; each change is logged                   | Must     |
| FR-08 | Staff can create a booking from a WhatsApp, phone, or form enquiry                               | Must     |
| FR-09 | Office pickup and delivery both produce a handover record with fuel, mileage, and photos         | Must     |
| FR-10 | Cancellation and refund follow the policy; refunds above the threshold need approval             | Must     |
| FR-11 | Currency selector changes display only; charges stay in KES                                      | Should   |
| FR-12 | Reviews requested after handover and return; shown once the threshold is met                     | Should   |
| FR-13 | Public pages are indexable, with structured data and a sitemap                                   | Must     |
| FR-14 | Staff see KPI cards and an activity feed on the dashboard home                                   | Should   |
| FR-15 | Corporate accounts invite staff and approve bookings within a limit                              | Later    |

## 7. Non-functional requirements

- Homepage LCP under 2 seconds; INP under 150 ms; CLS under 0.05; Lighthouse 90+ mobile, 95+ desktop.
- Availability target 99.5 percent a month.
- WCAG 2.1 AA on all customer screens.
- Customer data protected under Kenya's Data Protection Act, 2019, with legal review before launch.
- All prices and totals calculated on the server.
- Every staff read of an identity document is logged.
- Times stored in UTC and displayed in Africa/Nairobi.

## 8. Business rules (summary)

Full rules are in section 8 of the pack. Proposed defaults, to be confirmed by the owner: deposit 30 percent of total; cancellation refund 100 percent more than 72 hours before pickup, 50 percent for 24 to 72 hours, nothing under 24 hours; minimum hire age and licence years set per class.

## 9. Success metrics

| Metric                                       | Target at 6 months                                |
| -------------------------------------------- | ------------------------------------------------- |
| Online bookings per month                    | 60                                                |
| Quote-to-booking conversion                  | 25 percent                                        |
| Bookings with no staff phone call            | 60 percent                                        |
| Average time from quote to confirmed booking | Under 15 minutes                                  |
| Customer rating after return                 | 4.5 of 5, once the threshold is reached           |
| Organic clicks to location and service pages | Baseline set after 90 days of Search Console data |

## 10. Dependencies and risks

Tingg merchant approval; M-PESA through Tingg; ZeptoMail and Mobile Sasa accounts; lawyer review of the agreement, privacy notice, and retention schedule; owner sign-off on rates and policy; confirmation of which cities and airports are served. Main risk: staff keep using WhatsApp rather than the inbox. Mitigation: quick booking from enquiries, and a rule that all bookings go into the system.

## 11. Open questions

1. Owned fleet only, or independent owners also listed?
2. Final rates, VAT treatment, and cancellation policy.
3. Minimum driver age and licence years; security deposit yes or no.
4. Does the agreement need e-signature at launch, or is a signed upload enough?
5. Are eTIMS receipts required at launch?
6. Brand colour and logo.
7. Which cities and airports are served.
8. Does the company accept any foreign-currency payment?
9. Is English the only language at launch?
10. TypeScript or JavaScript for the codebase.

## Foreign-Currency Payments&#32;

The owner confirmed that the company will accept foreign-currency payments, not only display foreign prices. Before the payment module is built, the following must be specified:

- Which currencies are accepted (USD and EUR as a starting point) and whether Tingg supports each one for the company's account.
- Which currency is charged, and how the exchange rate is set and locked at the time of payment (the stored booking total stays in KES, with the foreign amount recorded alongside it).
- Refund currency: refunds return in the currency originally paid, with any exchange difference explained to the customer.
- Tax treatment of foreign-currency receipts and whether they change VAT or eTIMS handling (confirm with the accountant).
- Settlement: how foreign receipts reach the company's bank account and any fees charged on conversion.

Until these are confirmed, only KES charges are built, and the currency selector remains display-only.

## Decisions on Open Questions&#32;

This section answers the open questions in section 11. Where a point is still open, it says so.

| #   | Question                                             | Decision                                                                                                                                                                                                                                                                                                                                      |
| --- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Owned fleet only, or independent owners also listed? | Hybrid model. The owned fleet is the primary offer. Partner vehicles may be listed later, clearly labelled as partner vehicles, under the phased plan in section 20.2.                                                                                                                                                                        |
| 2   | Final rates, VAT treatment, and cancellation policy. | VAT is included in the final price shown to the customer, where the law and the accountant allow it. Breakdown lines show the VAT amount. Cancellation policy: see row 3.                                                                                                                                                                     |
| 3   | Cancellation window                                  | A 24-hour cancellation window applies for now, subject to change. Proposed reading, to confirm: a cancellation made more than 24 hours before pickup refunds the refundable deposit in full; a cancellation within 24 hours is not refunded. The 72-hour and 50 percent tiers in section 8 are removed.                                       |
| 4   | Does the agreement need e-signature at launch?       | Yes. E-signature is in place at launch. Office signing remains available.                                                                                                                                                                                                                                                                     |
| 5   | eTIMS receipts required at launch?                   | Integrate eTIMS if technically possible at launch; otherwise it follows immediately after. The tax receipt is optional for the renter. At checkout the customer can choose "Request tax receipt (eTIMS)". If chosen, the eTIMS receipt is generated. If not, the customer receives a standard receipt. The eTIMS details in section 15 apply. |
| 6   | Brand colour and logo                                | Owner asked for colour options. Proposed palette below; the owner picks one. Logo still to be supplied.                                                                                                                                                                                                                                       |
| 7   | Which cities and airports are served?                | The admin defines served cities and airports in the admin area (`/admin/locations`). Location and city pages are created and removed from that setting, with no code change.                                                                                                                                                                  |
| 8   | Foreign-currency payment                             | Confirmed in scope. See the Foreign-Currency Payments section above.                                                                                                                                                                                                                                                                          |
| 9   | Language at launch                                   | English is primary. Planned languages: Swahili (first), then Spanish, French, German, and Chinese (Simplified), with other major languages added where demand justifies them. All copy is held as message keys, so each language is a translation file, not a code change.                                                                    |
| 10  | TypeScript or JavaScript                             | JavaScript. See the Owner Decisions log.                                                                                                                                                                                                                                                                                                      |

**Proposed colour palette (for the owner to choose)**

Contrast ratios below are calculated for text on white. All options pass WCAG 2.1 AA for body text (4.5 to 1). Confirm in the design file before use.

| Option          | Accent                                                           | Contrast on white                                       | Character                                                                        |
| --------------- | ---------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------- |
| A (recommended) | Deep blue #0A5CC8                                                | About 6.2 to 1                                          | Clear, trustworthy, close to the Apple-style interface                           |
| B               | Deep green #1F6F4A                                               | About 6.1 to 1                                          | Calm and premium; ties to the Kenyan context without using national-flag colours |
| C               | Charcoal #1D1D1F with a brass accent #9A7B3C for highlights only | Charcoal passes; brass is decorative only, not for text | Most restrained, closest to a luxury feel                                        |

Option A is the default in the design system until the owner chooses.

**Remaining open items**

- Minimum licence years for each class.
- Confirmation of the 24-hour cancellation reading in row 3.
- Logo file and brand guidelines.
- Final colour choice (row 6).
