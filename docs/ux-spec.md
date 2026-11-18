# User Experience Specification (UX Spec)

**Purpose:** Defines how users move through the product: flows, decisions, states, and errors. Read with the PRD (what it does) and the IA (where each screen lives).

## 1. Principles

- One decision per screen; one primary action per screen, placed at the bottom on phones.
- Show the price and the next step at all times.
- Ask for information in groups, only when it is needed (progressive forms).
- Every error says what happened and what to do next, in plain English.
- Mobile first; touch targets at least 44 px on customer screens.

## 2. Customer flow: quote to return

| Step | Screen            | User decision                          | System response                                   | Exit or branch                                                    |
| ---- | ----------------- | -------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------- |
| 1    | Search            | Dates, location, class                 | Live availability counts                          | No availability: suggest nearby dates or WhatsApp                 |
| 2    | Vehicle selection | Pick a vehicle                         | Price per day and total for dates                 | Changes dates: prices recalculated                                |
| 3    | Quote summary     | Add extras; choose office or delivery  | Breakdown from pricing service; quote timer shown | Quote expires: re-price with notice                               |
| 4    | Customer details  | Name, phone, email, company (optional) | Validation inline                                 | Company: asks for KRA PIN and billing contact                     |
| 5    | Payment           | Choose M-PESA, card, or bank           | Tingg checkout; deposit amount shown              | Payment fails: retry or pay another way; hold kept for 30 minutes |
| 6    | Confirmation      | Read the timeline and next steps       | Booking reference, timeline, pickup details       | Documents not yet uploaded: prompt to upload                      |
| 7    | Documents         | Upload ID and licence                  | Upload progress; accepted formats stated          | Rejected: reason shown; re-upload                                 |
| 8    | Agreement         | Sign now or at office                  | PDF to read; signature captured                   | Sign at office: pickup marked accordingly                         |
| 9    | Handover          | Office pickup or delivery time window  | Map and entrance note, or delivery window         | Change: allowed within policy                                     |
| 10   | Active and return | View rental; return vehicle            | Return confirmation; review request               | Late return: charge shown with reason                             |

## 3. Booking changes and cancellation

- Date change: allowed once, up to 24 hours before pickup, if the vehicle is free; otherwise re-priced.
- Cancellation: shows the refund amount from the policy before the customer confirms.
- A cancellation inside the no-refund window requires the customer to tick an acknowledgement.
- Cancellations and changes never happen silently; each one sends a confirmation.

## 4. Corporate flow

1. Company admin invites staff by email.
2. Staff member books through the same flow; company billing is selected.
3. Bookings above the approval limit go to an approver, who sees the reason and total.
4. Approver approves or rejects with a note; the requester is notified.
5. Monthly, the company receives one statement and invoice.

## 5. Staff flow

- **Inbox.** Opens on today's and tomorrow's bookings, grouped by status. Overdue items show first.
- **Enquiry to booking.** Staff open an enquiry, pick the dates and class, see the live quote, and create the booking. The enquiry is linked.
- **Document review.** Staff open a document, view it in a secure viewer, then approve or reject with a reason.
- **Handover.** Staff record fuel, mileage, and photos at pickup and return; the customer signs on the staff device.
- **Refund.** A staff member requests; an admin approves above the limit.

## 6. States every screen must handle

| State                      | Rule                                                         |
| -------------------------- | ------------------------------------------------------------ |
| Loading                    | Skeleton of the final layout, not a spinner over blank space |
| Empty                      | One sentence on why it is empty and one action               |
| Error                      | Plain message, a retry button, and the WhatsApp fallback     |
| Offline or weak connection | Form data kept; message that the action has not completed    |
| Success                    | Confirmation with the reference and next step                |
| Unauthorised               | Sent to sign in, then back to the same screen                |

## 7. Notifications

| Event              | Channel            | Timing                         |
| ------------------ | ------------------ | ------------------------------ |
| Quote created      | Email (on request) | Immediate                      |
| Deposit received   | Email and SMS      | Within 2 minutes               |
| Documents rejected | Email and SMS      | Immediate, with reason         |
| Agreement ready    | Email              | Immediate                      |
| Pickup reminder    | SMS and email      | 24 hours before                |
| Delivery window    | SMS                | Day before and on the day      |
| Return reminder    | SMS                | Morning of the return date     |
| Review request     | SMS and email      | 1 day after handover or return |

Every message includes an opt-out path where the privacy notice requires it.

## 8. Accessibility

- Labels on every field; errors linked to fields.
- Keyboard navigation for all staff screens.
- Focus visible on every interactive element.
- Text does not depend on colour alone; status uses an icon and a word.
- Reduced motion respected.

## 9. Open questions

1. Can customers pay the balance in instalments?
2. Does a late return have a grace period of 30 minutes, as proposed?
3. Is a WhatsApp handoff from the error state required at launch?

## Decisions on Open Questions (15 November 2026)

- Instalments: not offered. Customers pay the deposit up front and the balance before handover, or at the office for corporate accounts on credit terms.
- Late-return grace period: 1 hour, subject to change. The earlier 30-minute proposal is replaced.
- WhatsApp handoff from the error state: included at launch.

## Helping Customers Choose (added 15 November 2026)

Customers choose a vehicle with fewer options, a clear recommendation, and an easy way to change their mind. The rules below are rule-based, not AI, and are built into the MVP.

**1. Guided choice, before the list**

The search asks three questions, each with tap-able answers: how many passengers (1 to 4, 5 to 7, 8 or more), the purpose (airport transfer, executive or business, event, long trip, other), and the number of days. The answers filter the classes, so the list is short from the start.

**2. One recommended class**

The screen shows one recommended class, selected by default, with the reason in one sentence, for example: "Recommended: 5 passengers and luggage for an airport transfer." The recommendation follows the seats, luggage, and best-for tags in the vehicle class data (section 5 of the pack). The customer can accept it or choose another.

**3. Comparison of two or three, not a grid**

"Compare with other options" shows up to three classes side by side. The table shows only the differences that matter: price for the chosen duration, seats, luggage, and what is included. Identical rows are hidden.

**4. Total price first, per day second**

Each option shows the total for the customer's dates, including delivery and the refundable deposit, before the daily rate. Customers compare the amount they will pay, not a daily figure that hides the extras.

**5. Choices reversible at low cost**

A free date change once (section 8) and the refundable deposit make the first decision low-risk. The product says so on the quote screen, in plain words: "You can change dates once, free, up to 24 hours before pickup."

**6. Limits on what is shown**

- At most three options on any screen, with "Show more" for the rest.
- No more than five items in any menu. Longer lists are filtered first.
- Each option is described in one line of plain words, not a spec sheet. The full specs sit behind a "Details" link.

**7. Honest social proof only**

A label such as "Most booked for airport transfers" appears only when the booking data supports it, for the period stated. No invented popularity labels and no fake scarcity (section 19 rule).

**What we do not do**

- Pre-tick extras or insurance the customer did not choose.
- Show crossed-out "was" prices that do not reflect a real earlier rate.
- Hide the cancellation terms behind a link on the final step.

**Measure it**

- Quote-to-booking conversion by step (analytics document).
- Share of customers who accept the recommended class without changing it.
- Share who leave the choice screen without selecting, reviewed after the first 50 quotes.

**Phase change.** The guided recommendation, previously planned for Phase 6, moves into Phase 2 of the roadmap. The AI advisor remains in Phase 6, and only if the rule-based version shows demand.
