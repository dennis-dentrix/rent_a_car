# Page priorities and notifications

Owner request, 26 November 2026: bookings and messages come first for companies and renters, and people are told about
them as fast as possible. This file says how every page ranks and how each person is told.

## 1. Priority levels

| Level | Meaning                            | Where it sits                                  |
| ----- | ---------------------------------- | ---------------------------------------------- |
| P1    | Someone is waiting. Act now.       | First screen, phone tab bar, live badge, email |
| P2    | Used most days.                    | Side menu, near the top                        |
| P3    | Set up once, changed now and then. | Side menu lower down; under "More" on a phone  |
| P4    | Reading and reference.             | Footer or "More"                               |

## 2. Rental company

| Level | Pages                                                                   |
| ----- | ----------------------------------------------------------------------- |
| P1    | Today (requests waiting, unread messages), Bookings, Messages           |
| P2    | Calendar, Cars, pickup and return inspections                           |
| P3    | Company (with drop-off and pick-up), Policies, Services, Places, Owners |
| P4    | Inspections list, Settings                                              |

Phone tab bar: Today, Bookings, Messages, Cars. Every page is in the menu at the top right, and the top bar carries a
bookings button with a count.

## 3. Renter

| Level | Pages                                      |
| ----- | ------------------------------------------ |
| P1    | The next booking, My bookings, Messages    |
| P2    | Cars search, a car, booking, the agreement |
| P3    | Settings, inspection reports               |
| P4    | Home, service pages, guides, privacy       |

Phone tab bar when signed in: Home, Cars, Messages, Bookings. The top bar carries a bookings button with a count of
bookings that changed since the renter last opened them, and the menu button.

## 4. Platform admin

| Level | Pages                                   |
| ----- | --------------------------------------- |
| P1    | Overview, companies waiting for review  |
| P2    | Bookings, enquiries, documents          |
| P3    | Vehicle classes, settings, team, guides |
| P4    | Audit log                               |

Admin pages and menus are unchanged for now; the page list in `booking-flow-plan.md` §11 still waits for approval.

## 5. How each person is told

| Event                       | Who            | In the app                    | Email                            |
| --------------------------- | -------------- | ----------------------------- | -------------------------------- |
| New booking request         | Company        | Badge, pop-up, top of Today   | At once, with the answer-by time |
| Instant booking             | Company        | Pop-up through Bookings       | At once                          |
| Request answered or expired | Renter         | Booking page, bell count      | At once                          |
| New message                 | The other side | Badge, pop-up, unread in list | At once, see rule below          |
| Company waiting for review  | Admin          | Overview count                | Not yet built                    |

**Message email rule.** An email goes when a message is the first one the reader has not seen. While messages stay
unread, at most one more every 15 minutes. None while the reader has that chat open. The words of a message stay in the
app.

**Speed.** The app asks for new items every 10 seconds while open (every 30 seconds in a hidden tab). Emails leave as
soon as the change is saved, and a job every minute retries any that failed. With the browser's permission, a desktop
alert shows while a Carvo tab is open. Alerts with the app closed (web push) and SMS are not built.

**Needed to send email:** `ZEPTOMAIL_TOKEN`, `ZEPTOMAIL_FROM` and `APP_URL`. Without them emails wait in the queue.

## 6. Drop-off and pick-up

Each company switches these on in Company:

- **Drop-off:** the company brings the car to the renter's pick up location.
- **Pick-up:** the company collects the car when the hire ends.

A renter sees only what the company offers and may ask for it while booking. Every booking records the pick up location
and the destination. No fee is added; a fee needs the owner's ruling.
