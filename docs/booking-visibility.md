# Booking Visibility: Timeline, Reminders, and Renter Control

Plan. Phase 1 approved and built on 25 November 2026; later phases are not started. Goal: fewer cancellations and no-shows, by letting a renter see what is happening and do small useful things while they wait.

## 1. What exists today

| Need | Today |
| --- | --- |
| A booking page for the renter | **None.** `/account` shows name and email only. The API has `GET /bookings` and `GET /bookings/{id}`. |
| Statuses | `quoted`, `pending_payment`, `confirmed`, `ready`, `active`, `returned`, `closed`, `cancelled`, `expired`, checked by `domain/booking-status.js` and the database. |
| History | `booking_status_events`: append-only, with actor, note, and time. |
| Company actions | Admin and staff change status. A company only reads its bookings. |
| Messages | An email queue (`notifications`) sent each minute by the Worker's cron. ZeptoMail is not set up, so nothing is delivered yet. |
| Delivery | `deliveries` holds the address, time window, driver, and status. |
| Reschedule, cancel | `PATCH /bookings/{id}` (dates, once) and `POST /bookings/{id}/cancel`. |

## 2. Decisions needed before building

| # | Conflict | Recommendation |
| --- | --- | --- |
| 1 | WhatsApp messages and "call or WhatsApp" preference. Ruling of 23 November: chats stay in the app, no WhatsApp links. | Keep the ruling for links and chat. Decide whether one-way WhatsApp notices are allowed; until then email, then SMS. |
| 2 | SMS through Mobile Sasa is deferred (product pack 24.12). | Lift the deferral when a sender ID and credit exist. Build the channel now, switch it on later. |
| 3 | Cancellation and reschedule wording was withdrawn with deposits until the owner supplies it. Section 25.3's moderate and strict terms are open. | Owner writes the wording. The page shows it only once it exists. |
| 4 | "Requested" and "Quote sent" assume the request-and-accept flow (25.3), which is not built. | Show those two steps only for bookings that have them. Start the timeline at what the booking has reached. |
| 5 | The brief keeps an office visit to sign. Online signing also exists. | One step, "Agreement signed", done online or at the office. |
| 6 | "You're confirmed" straight after booking. | Say "We have your request" until the company confirms. The screen never says confirmed before the server does. |
| 7 | Company-editable templates. WhatsApp requires each template to be approved by Meta. | Companies edit email and SMS wording within fixed fields. WhatsApp wording is fixed. |

## 3. Design

**One state machine, not two.** Booking status stays the source of truth. The extra steps a renter sees are milestones, recorded beside it, so no price or availability rule changes.

| Timeline step | Comes from | Who acts next |
| --- | --- | --- |
| Booking received | status `pending_payment` | Company |
| Confirmed | status `confirmed` | Renter: documents and agreement |
| Agreement signed | the signature record | Company |
| Car prepared | milestone `car_prepared` | Company |
| Ready for pickup, or on the way | status `ready`; milestone `en_route` for delivery | Renter |
| Trip under way | status `active` | Renter |
| Completed | status `returned`, then `closed` | Nobody |

The moving-car indicator is driven by `en_route` and `arrived`, with no map. GPS comes later.

**Live updates by polling**, every 20 seconds while the page is visible. The web app never queries the database, so Supabase Realtime is not used.

**Reminders that cannot send twice.** No stored job per booking. Each minute the job asks which bookings are due a message and inserts into the queue with a unique key, `booking:kind:start time`. Running it again inserts nothing. A new start time makes a new key, and unsent messages for the old time are cancelled in the same transaction.

**One sender, several channels.** `send(channel, message)` with adapters for ZeptoMail, Mobile Sasa, and WhatsApp. A channel that is not set up, or fails for good, falls back to email.

## 4. Database changes (to be written after approval)

- `booking_milestones`: booking, step, actor, time. Append-only.
- `bookings`: `flight_number`, `driver_note`, `contact_preference`, `no_show_at`.
- `notifications`: `channel`, `to_phone`, `dedupe_key` (unique), `cancelled_at`, status `cancelled`.
- `message_templates`: company (null is Carvo's), kind, channel, language, wording.
- `profiles`: `language` (`en` or `sw`).
- Row Level Security and indexes in the same migrations; a company writes milestones only for its own bookings.

## 5. API

| Route | Does |
| --- | --- |
| `GET /bookings/{id}/timeline` | Steps, the current one, who acts next, last updated. |
| `PATCH /bookings/{id}/details` | Drop-off detail, flight number, note, contact preference. |
| `POST /bookings/{id}/events` | Records `reschedule_clicked` and "contact the company". |
| `POST /operator/bookings/{id}/milestones` | One tap moves a step and queues its message. |
| `POST /operator/bookings/{id}/no-show` | Marks a no-show after the start time. |
| `GET`, `PUT /operator/message-templates` | A company's wording. |
| `POST /internal/jobs/booking-reminders` | 24 hour and 1 hour reminders, and overdue nudges to the company. |

## 6. Screens

- Renter: `/account/bookings` and `/account/bookings/{id}` with `BookingTimeline`, `NextStep`, `DeliveryProgress`, `TripDetailsForm`, `RescheduleOrCancel` (reschedule offered first).
- Company: one large "next step" button on each booking, and an overdue list on Today.
- Mobile first, times in Africa/Nairobi.

## 7. Messages

Booking received, 24 hours before, 1 hour before, after the trip (optional, with a review link). Each short, in English and Swahili, with company, car, date, time, place, and a link to the booking. Swahili wording needs a fluent reader's check.

## 8. Analytics

Use the names in `analytics-events.md` where they exist: `booking_created`, `reminder_sent`, `booking_cancelled` (not `cancelled`). Add `reschedule_clicked` and `booking_no_show`. All sent by the server.

**Measuring.** Cancellation rate is cancelled bookings divided by confirmed ones, by week. There is little history, so record the events for a few weeks before the reminders are switched on, or there is no "before".

## 9. Phases

| Phase | Build | Gate |
| --- | --- | --- |
| 1 | Renter booking pages, timeline, company milestones, polling, events | A renter watches a booking move on a phone as the company taps through it |
| 2 | Email reminders, templates, overdue nudges (needs ZeptoMail) | A job run twice sends once; a reschedule moves the reminders |
| 3 | Renter actions: details, contact preference, reschedule, cancel | Reschedule is offered before cancel; the policy wording is shown |
| 4 | SMS, then WhatsApp if allowed; company wording | Fallback to email proven for each channel |

## 10. Test checklist

- [ ] Each status and milestone shows the right current step and next actor.
- [ ] A company cannot move another company's booking; a renter sees only their own.
- [ ] Reminder job run twice, and run in parallel: one message.
- [ ] Reschedule and cancel stop the old reminders.
- [ ] A booking made less than 24 hours ahead gets no late "24 hours" message.
- [ ] A failed channel falls back to email, once.
- [ ] English and Swahili render with every field filled; SMS fits its length.
- [ ] Timeline updates within 20 seconds and stops polling when hidden.
- [ ] Times read correctly in Africa/Nairobi.
- [ ] Events fire once each, with no personal data in them.

## 11. Phase 1 as built

- Migration `20261125000006_booking_journey.sql`: `booking_milestones`, `bookings.no_show_at`, and the functions `record_milestone`, `mark_no_show`, and `booking_outcomes`.
- The journey replaces the deposit-based timeline in `domain/booking-timeline.js`; `GET /bookings/{id}` returns it as `journey`.
- API: `GET /operator/bookings/{id}/journey`, `POST .../milestones`, `POST .../no-show`, `GET /admin/booking-outcomes`.
- Pages: `/account/bookings`, `/account/bookings/{id}`, the company's booking page, and a weekly table on `/admin`.
- Analytics: cancellations and no-shows are counted from the database, not sent to PostHog. This is exact and needs no consent. `reschedule_clicked` arrives with the reschedule button in phase 3.
- Not in this phase: a contact button, online agreement signing in the web app, and any message to the renter.

