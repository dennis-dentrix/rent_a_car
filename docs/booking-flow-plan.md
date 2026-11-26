# Booking Flow: Renter and Operator Direct

Plan, 25 November 2026. Decisions in section 5 approved by the owner; nothing built. It applies product pack section 25.3 ("as on Booking.com and Airbnb") and the owner's feedback of the same day.

## 1. Principles

- The renter deals with the operator. Carvo's admin approves companies and settles disputes, and takes no part in a booking.
- Simplicity is the ultimate sophistication (owner, 25 November 2026): in code, design, architecture and experience, with a touch of polish. Prefer removing a page, step or field to adding one.
- A listed car is available unless a booking or an operator's block covers the dates.
- Few steps, one main action on each screen.
- The look is simple, premium, and trustworthy.

## 2. Renter

Modelled on the Booking.com stays flow, walked through on 25 November 2026: search, results with total prices and filters, one detail page, then a short details step with the price beside it and no charge yet. The difference here: the renter can talk to the company before deciding. The flow is followed, not the look or the wording.

| Step | Screen       | The renter sees and does                                                                                       |
| ---- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| 1    | Home         | Pickup place, destination, dates, self-drive or chauffeur, then Search. Available cars show below.             |
| 2    | Results      | Only cars free for those dates: photo, name, company, total price. Filters: class, price, gearbox, seats.      |
| 3    | Car          | Photos, key facts, total for the dates, company rules. "Book" or "Request to book", and "Message the company". |
| 4    | Messages     | A chat with the company, headed by the car and the trip details. The renter can book from the chat.            |
| 5    | Your details | Sign in or create an account in place, date of birth, check the trip and price, accept the rules, confirm.     |
| 6    | Trip         | Status, pickup details, agreement, documents, inspection reports, the same chat.                               |

### Trip details

| Detail                  | Asked at     | Used for                                                       |
| ----------------------- | ------------ | -------------------------------------------------------------- |
| Pickup place            | Search       | Which cars can serve the trip                                  |
| Where the trip is going | Search       | Shown to the company; checked against its cross-border rule    |
| Dates, and so the days  | Search       | Availability and price                                         |
| Self-drive or chauffeur | Search       | Which cars show, and the chauffeur price                       |
| Car type (class)        | Results      | A filter                                                       |
| Date of birth           | Your details | Age rule (platform minimum 21, or the company's higher figure) |

- Search choices carry through every step and are never asked twice. A signed-in renter's details are filled in.
- The renter gives a date of birth, not an age. The company checks it against the ID before handover. A booking under the minimum age is refused by the server.
- A car opened from a shared link whose dates are taken says "Not available for these dates" and offers other dates and similar cars.

### Messages

- Messaging before booking is optional (owner, 25 November 2026). A renter may book without it.
- A message needs an account. It does not hold the car.
- Phone numbers and email addresses stay hidden until a booking is confirmed (section 25.3). Chats stay in the app.

### After sign-in

- A renter who signed in during a search or booking returns to that exact screen.
- Otherwise: an upcoming trip opens that trip; with none, the search page with available cars.
- There is no separate renter dashboard. "My trips", "Messages", and "Settings" sit in the account menu.

## 3. Operator

| Step | Screen   | The operator does                                                                      |
| ---- | -------- | -------------------------------------------------------------------------------------- |
| 1    | Sign in  | A company sign-in reached from `/operators`, landing on the dashboard.                 |
| 2    | Today    | Requests waiting (accept or decline), pickups, returns, cars out, money expected.      |
| 3    | Booking  | One next-step button: accept, prepare, hand over, receive back, close. Record payment. |
| 4    | Calendar | Block a car for dates taken outside the platform.                                      |
| 5    | Cars     | Add a car: photos, a class from the platform list, and its daily price.                |

Blocks matter: without them a car hired by phone still shows as free.

## 4. Gap between today and this plan

| Needed                       | Today                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| Free cars for chosen dates   | Availability is counted per class. Cars are hidden once dates are set.                |
| Book a particular car        | The car page sends a question or links to its class.                                  |
| The car's price charged      | Renters are charged Carvo's class rate. The car's own rate is unused.                 |
| Admin-only classes           | Operators can create their own classes and price classes.                             |
| Book in the web app          | No screen. `POST /bookings` exists.                                                   |
| Operator accepts and runs it | Only admin and staff change status.                                                   |
| `requested`, `declined`      | Statuses not added.                                                                   |
| Block dates                  | Not built.                                                                            |
| Questions reach the company  | Enquiries go to the admin.                                                            |
| Trip details and age check   | No destination or date of birth is collected. Minimum age is stored but not enforced. |
| Chat before booking          | Not built. A question goes to the admin as an enquiry.                                |
| Renter landing after sign-in | A plain sign-in opens `/account`.                                                     |
| Notices to both sides        | Email is queued but not set up.                                                       |

The database already refuses two holding bookings of one vehicle on overlapping dates, and `create_booking_from_quote` already accepts a chosen vehicle.

Sign-in: from the code, an operator signing in with a password and no return address goes to `/console`. The page is shared with renters and worded for them. Not yet tried in a browser.

## 5. Decisions (approved 25 November 2026)

| #   | Decision           | Ruling                                                                                                                                |
| --- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Instant or request | Per car, as in 25.3. Instant by default; the operator may switch a car to Request.                                                    |
| 2   | Price              | The operator sets a daily price on each car, and the renter pays it. A car without a price is not listed. A class never sets a price. |
| 3   | Account            | Needed to book, created at the confirm step. Payment stays at handover.                                                               |
| 4   | ID and licence     | The operator checks them for its own bookings only, with a logged reason.                                                             |
| 5   | Booking status     | The operator moves it. Admin only steps in for a dispute.                                                                             |
| 6   | Classes            | Only the admin defines them. Operators choose from the list.                                                                          |

### Classes

| Class     | What belongs                 | Examples               |
| --------- | ---------------------------- | ---------------------- |
| Compact   | Small, economical hatchbacks | Vitz, Fit, Demio       |
| Sedan     | Everyday saloons             | Axio, Premio, Camry    |
| SUV       | Mid-size SUVs                | CX-5, Harrier, X-Trail |
| Large SUV | Seven seats, off-road        | Prado, Land Cruiser    |
| Van       | Groups                       | Noah, Hiace            |
| Luxury    | Premium and performance      | G63, RS Q8, RS7        |

- Each class has a name, a one-line meaning, example models, and a photo, shown to the operator while choosing.
- The admin may rename, add, or hide classes, and may move a car listed in the wrong one. A class with cars is hidden only after they are moved.
- The operator's "Classes and prices" page goes away. Existing bookings keep their price from the pricing snapshot.

## 6. Build order

| Phase | Build                                                                                      | Gate                                          |
| ----- | ------------------------------------------------------------------------------------------ | --------------------------------------------- |
| A     | Visual direction: home, results, car, and operator Today, as designs                       | Owner approves the look                       |
| B     | Admin classes, price per car, per-car availability, blocks: migration, row security, tests | Pricing and double-booking tests pass         |
| C     | Renter search, results, car, confirm, trip                                                 | A renter books on a phone with no admin help  |
| D     | Operator accept, decline, status moves, payment record, dashboard, email notices           | An operator runs a hire from request to close |
| E     | Remove admin booking screens and other unneeded dashboard pages                            | Owner agrees the page list                    |

Chat is needed before a renter books, so it is built in phase C, with the company's replies in the operator console.

## 7. Conflicts to settle

- The working ruling "Guests do not pay online. A guest submits an enquiry" and "staff confirm bookings by hand" predate section 25.3 and give way to this plan.
- `operator-console.md` sections 3 and 12 (operator classes and class rates, renter prices from Carvo's rates) give way to decisions 2 and 6.
- A shorter home page moves search-engine text and guides off it, which `growth-seo.md` may expect there.

## 8. Phase B steps (started 25 November 2026)

| Step | Build                                                                                                                                                       | State                                        |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| B1   | Blocked dates (`vehicle_blocks`): a block and a holding booking of one car can never overlap. Free cars with a price for chosen dates (`free_vehicle_ids`). | Built; database tests pass                   |
| B2   | A quote for a particular car, priced from the car's daily rate; booking and date change keep that car.                                                      | Built; no platform discounts apply to a car  |
| B3   | Only the admin writes classes; the starting list of six; operator class rates and the "Classes and prices" page removed.                                    | Built; operator "Classes and prices" removed |

The class-based quote stays until the renter screens of phase C use the car-based one, so the site keeps working in between.

## 9. Phase C steps (started 25 November 2026)

| Step | Build                                                                                                              | State |
| ---- | ------------------------------------------------------------------------------------------------------------------ | ----- |
| C1   | Search results: only priced cars, free for the dates, each with its total. The class grid leaves the results page. | Built |
| C2   | Car page and confirm: total for the dates, sign in, date of birth and age rule, destination, instant booking.      | Built |
| C3   | Trip page: status, documents, agreement, inspection reports.                                                       | Built |
| C4   | Optional messages between renter and company, with the company's replies in its console.                           | Built |

Request-to-book needs the new statuses of phase D, so C2 books instantly. Class pages still show class prices until C2 replaces their quote.

C2 as built: the destination is asked once, on the confirm step, not in the search bar. Company rules are not yet shown there.

C3 as built: the renter uploads ID and licence and signs online. Until phase D, the files are checked by the admin, not the company.

C4 as built: one conversation for each renter and car, opened from the car page. Phone numbers and email addresses are hidden until the renter has a confirmed booking with that company. No message notifications yet, as email is not set up.

## 10. Phase D steps (started 25 November 2026)

| Step | Build                                                                                          | State                             |
| ---- | ---------------------------------------------------------------------------------------------- | --------------------------------- |
| D1   | The company runs a hire: checks ID and licence, moves the booking on, records payment.         | Built                             |
| D2   | Request to book: the choice per car, requested and declined statuses, accept, decline, expiry. | Built                             |
| D3   | The Today dashboard, blocked dates on a calendar, and a company sign-in.                       | Built                             |
| D4   | Email notices to both sides (needs the email service set up).                                  | Built; sends once email is set up |

D1 as built: the company moves its booking one step at a time or cancels with a reason, sees the renter's ID and licence only while the hire is ahead or under way, and records cash, M-PESA or bank payments. The admin screens for these remain until phase E.

D2 as built: each car is instant (the default) or on request, with 120 minutes to answer (an admin setting), never past the start of the hire. A request holds no dates; accepting one fails if the car has since been taken. The renter's phone and email stay hidden from the company until then. Car types show the price of their cheapest listed car.

D3 as built: Today shows four figures, requests to answer, and the day's handovers; the calendar shows two weeks with blocked dates; companies sign in at `/auth/company` and always land on their dashboard.

D4 as built: the renter and the company are emailed about instant bookings, requests and their answers, expiry, cancellation, date changes and new messages (at most once in fifteen minutes for a conversation, without its words). Emails link to the booking when `APP_URL` is set. Nothing is sent until `ZEPTOMAIL_TOKEN` and `ZEPTOMAIL_FROM` are set; until then notices wait in the queue.

## 11. Phase E page list (proposed 26 November 2026, not approved)

### Admin

| Menu      | Pages today                                    | Proposal                                                                      |
| --------- | ---------------------------------------------- | ----------------------------------------------------------------------------- |
| Overview  | Overview, More                                 | Keep, showing only companies to review, open contact messages, and live hires |
| Companies | Companies                                      | Keep; add each company's cars, so a car in the wrong class can be moved       |
| Bookings  | Bookings, booking page                         | Keep to read, for disputes; remove status, driver, and car assignment         |
| Messages  | Enquiries                                      | Keep to read, as contact messages to Carvo                                    |
| Classes   | Classes                                        | Keep                                                                          |
| Guides    | Guides, guide editor                           | Keep                                                                          |
| Settings  | Settings, Team, Audit log, Places              | One menu item with these four inside                                          |
| Removed   | Documents                                      | The company checks ID and licence                                             |
| Removed   | Cars, car page, Drivers                        | Companies own cars; nothing but the removed assignment uses drivers           |
| Removed   | Daily rates, Discounts, Extras, Delivery zones | No renter screen uses them; cars carry their own price                        |

### Company

| Menu     | Pages today                                  | Proposal                                           |
| -------- | -------------------------------------------- | -------------------------------------------------- |
| Today    | Today                                        | Keep                                               |
| Bookings | Bookings, booking, record inspection, report | Keep; reports are opened from their booking        |
| Calendar | Calendar                                     | Keep                                               |
| Cars     | Fleet, car page, Owners                      | Keep; owners become a section of Cars              |
| Messages | Messages                                     | Keep                                               |
| Company  | Company, Policies                            | Keep; rental rules become a section of Company     |
| Removed  | Inspections list                             | The same reports are on each booking               |
| Removed  | Services, Places                             | Nothing a renter sees reads these choices any more |

On phones the company keeps four tabs: Today, Bookings, Cars, More.

### Before removing

- Any open booking on a platform car (no company) must be finished first: only the admin screens can move it.
- Pages go first; the unused server routes and class-based quoting follow once nothing calls them.
- Existing records are kept. Only screens are removed.
- Reading a conversation for a dispute, with a logged reason, is not part of this phase.
