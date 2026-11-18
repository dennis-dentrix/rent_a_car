# Analytics and Event Tracking Document

**Purpose:** Defines what is measured, how each event is named and structured, when it fires, and who owns it. Tool: PostHog (proposed; subject to the privacy review in section 7 of the pack). Consent is requested before tracking where the privacy notice requires it.

## 1. Principles

- Measure the decisions the business makes: whether to change a price, a page, or a flow.
- Track events, not people. No names, phone numbers, ID numbers, or addresses in event properties.
- One event dictionary. Every event in this document, and nothing else, is sent.
- Events are fired from the server where money or status is involved, so they cannot be faked from the browser.
- Naming: `object_action` in snake\_case, past tense (for example `quote_completed`).

## 2. Common properties (sent with every event)

| Property           | Type           | Example                 | Notes                                                       |
| ------------------ | -------------- | ----------------------- | ----------------------------------------------------------- |
| `session_id`       | string         | random                  | Anonymous session                                           |
| `user_id`          | string or null | uuid                    | Internal id only; never email or phone                      |
| `role`             | string         | `customer`              | `guest`, `customer`, `corporate_approver`, `staff`, `admin` |
| `device`           | string         | `phone`                 | `phone`, `tablet`, `desktop`                                |
| `locale`           | string         | `en-KE`                 |                                                             |
| `display_currency` | string         | `KES`                   | Display only                                                |
| `page_path`        | string         | `/cars/executive-sedan` | No query strings with personal data                         |
| `source`           | string         | `google_organic`        | From referrer, UTM, or direct                               |

## 3. Funnel events (customer)

| Event                     | Fires when                                  | Properties                                                                           | Owner   |
| ------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------ | ------- |
| `search_submitted`        | Customer submits dates, location, and class | `class_id` (optional), `city_slug`, `duration_days`                                  | Product |
| `class_viewed`            | Class page loads                            | `class_id`, `price_per_day_kes`                                                      | Product |
| `vehicle_viewed`          | Vehicle page loads                          | `vehicle_id`, `class_id`                                                             | Product |
| `sticky_bar_cta_clicked`  | Get quote tapped on phone                   | `page_path`                                                                          | Product |
| `quote_started`           | Quote builder first interaction             | `class_id`, `handover_type`                                                          | Product |
| `quote_completed`         | Quote created on the server                 | `quote_id`, `class_id`, `total_kes`, `deposit_kes`, `handover_type`, `duration_days` | Server  |
| `booking_details_started` | Customer details step opened                | `quote_id`                                                                           | Product |
| `booking_created`         | Booking row created                         | `booking_id`, `class_id`, `total_kes`, `handover_type`                               | Server  |
| `payment_started`         | Tingg checkout opened                       | `booking_id`, `amount_kes`, `method_selected` (if known)                             | Server  |
| `deposit_paid`            | Payment confirmed by webhook                | `booking_id`, `amount_kes`, `method`                                                 | Server  |
| `documents_uploaded`      | Each document uploaded                      | `document_type`                                                                      | Server  |
| `documents_verified`      | Staff verify a document                     | `document_type`, `hours_since_upload`                                                | Server  |
| `agreement_signed`        | Customer signs                              | `booking_id`, `signed_online` (boolean)                                              | Server  |
| `handover_completed`      | Staff complete handover                     | `booking_id`, `handover_type`                                                        | Server  |
| `booking_completed`       | Status moves to `closed`                    | `booking_id`, `total_kes`, `days`                                                    | Server  |

## 4. Lifecycle and retention events

| Event                     | Fires when                          | Properties                                       | Owner  |
| ------------------------- | ----------------------------------- | ------------------------------------------------ | ------ |
| `booking_changed`         | Dates or handover changed           | `booking_id`, `change_type`                      | Server |
| `booking_cancelled`       | Cancellation confirmed              | `booking_id`, `days_before_pickup`, `refund_kes` | Server |
| `review_requested`        | Review request sent                 | `booking_id`, `channel`                          | Server |
| `review_submitted`        | Customer posts a review             | `booking_id`, `rating`                           | Server |
| `reminder_sent`           | Pickup or delivery reminder sent    | `booking_id`, `channel`, `kind`                  | Server |
| `reminder_opt_in_changed` | Marketing opt-in changed            | `opt_in` (boolean)                               | Server |
| `account_created`         | Account created                     | `method` (`otp`, `email`)                        | Server |
| `guest_converted`         | Guest creates account after booking | `booking_id`                                     | Server |

## 5. Corporate events

| Event                | Fires when                    | Properties                                  |
| -------------------- | ----------------------------- | ------------------------------------------- |
| `company_created`    | Company profile created       | `company_id`                                |
| `staff_invited`      | Company admin invites staff   | `company_id`, `role`                        |
| `approval_requested` | Booking above limit submitted | `booking_id`, `total_kes`                   |
| `approval_decided`   | Approver approves or rejects  | `booking_id`, `decision`, `hours_to_decide` |
| `invoice_issued`     | Monthly invoice issued        | `company_id`, `total_kes`                   |

## 6. Staff and operations events

| Event                    | Fires when                              | Properties                                             |
| ------------------------ | --------------------------------------- | ------------------------------------------------------ |
| `enquiry_received`       | Enquiry created                         | `source`                                               |
| `enquiry_converted`      | Enquiry becomes a booking               | `enquiry_id`, `minutes_to_convert`                     |
| `status_changed`         | Any booking status change               | `booking_id`, `from_status`, `to_status`, `actor_role` |
| `document_rejected`      | Document rejected                       | `document_type`, `reason_code`                         |
| `vehicle_status_changed` | Vehicle moved to maintenance or retired | `vehicle_id`, `to_status`                              |
| `refund_requested`       | Refund request created                  | `payment_id`, `amount_kes`                             |
| `refund_approved`        | Refund approved                         | `refund_id`, `amount_kes`, `hours_to_approve`          |

## 7. Technical and quality events

| Event                       | Fires when                            | Properties                        |
| --------------------------- | ------------------------------------- | --------------------------------- |
| `payment_webhook_failed`    | Webhook processing error              | `provider_event_id`, `error_code` |
| `payment_webhook_duplicate` | Repeat webhook skipped                | `provider_event_id`               |
| `job_failed`                | Scheduled job fails after retries     | `job_name`, `error_code`          |
| `tax_receipt_failed`        | eTIMS submission fails (when enabled) | `attempts`                        |

These go to Sentry and PostHog with the same names.

## 8. Key metrics and their definitions

| Metric                   | Definition                                                         | Source events |
| ------------------------ | ------------------------------------------------------------------ | ------------- |
| Quote conversion         | `quote_completed` divided by `quote_started` in the same period    | Funnel        |
| Booking conversion       | `deposit_paid` divided by `quote_completed`                        | Funnel        |
| Drop-off by step         | Share of sessions reaching step N that do not reach step N+1       | Funnel        |
| Revenue (KES)            | Sum of `deposit_kes` plus balances paid for bookings in the period | Payments      |
| Most viewed class        | Count of `class_viewed` by `class_id`                              | Product       |
| Highest converting class | `booking_created` divided by `class_viewed` by `class_id`          | Funnel        |
| Time to confirm          | Median of `deposit_paid` minus `booking_created`                   | Server        |
| Time to verify documents | Median of `documents_verified` minus `documents_uploaded`          | Server        |
| Enquiry to booking time  | Median of `enquiry_converted.minutes_to_convert`                   | Staff         |
| Repeat customers         | Customers with two or more `booking_completed` events              | Server        |
| Review rate              | `review_submitted` divided by `review_requested`                   | Server        |

## 9. Dashboards

| Dashboard  | Audience           | Content                                                                |
| ---------- | ------------------ | ---------------------------------------------------------------------- |
| Funnel     | Owner, developer   | Steps from `search_submitted` to `booking_completed`; drop-off by step |
| Classes    | Owner              | Views, quotes, bookings, conversion by class                           |
| Operations | Operations manager | Enquiry time, document time, handover count                            |
| Revenue    | Owner              | Bookings and revenue by month, in KES                                  |
| Health     | Developer          | Webhook failures, job failures, errors                                 |

## 10. Quality rules

- An event is tested before release: fired once, correct properties, no personal data.
- A schema change to an event is a new version (`quote_completed_v2`); old events are not changed in place.
- Events not in this document are not added without updating it.
- The dashboard figures are checked against the database once a month.

## 11. Privacy rules

- No personal data in event properties.
- Marketing events only after opt-in.
- Users can opt out of analytics where the privacy notice requires it; the opt-out is respected on the next page load.
- Retention period for event data set in PostHog to match the privacy notice (to be confirmed with the lawyer).

## 12. Open questions

1. Confirm PostHog as the analytics tool after the privacy review.
2. Confirm the event retention period.
3. Who reviews the monthly metrics with the owner.
