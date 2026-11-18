# API Specification

**Purpose:** Defines the backend contracts before the frontend is built. Summary endpoint list is in section 12 of the pack; this document adds request and response shapes, validation, and error handling. Base path: `/api/v1`. Format: JSON.

## 1. Conventions

- Auth: `Authorization: Bearer <Supabase access token>` on all routes except public reads and webhooks.
- Money: integer KES. No decimals.
- Dates: ISO 8601 with offset; stored UTC; Nairobi displayed.
- IDs: UUID strings.
- Pagination: `limit` (default 20, max 100) and `cursor` (opaque). Response includes `next_cursor` or `null`.
- Idempotency: write requests accept `Idempotency-Key` (UUID). The same key within 24 hours returns the first response.
- Versioning: path prefix `/api/v1`; breaking changes go to `/api/v2`.

## 2. Response envelope

Success:

```json
{ "data": {}, "meta": { "next_cursor": null } }
```

Error:

```json
{
  "error": {
    "code": "BOOKING_OVERLAP",
    "message": "This vehicle is booked for those dates.",
    "details": {}
  }
}
```

## 3. Error codes

| Code                        | HTTP | When                                                           |
| --------------------------- | ---- | -------------------------------------------------------------- |
| `VALIDATION_FAILED`         | 400  | Body or query fails the Zod schema; `details` lists each field |
| `UNAUTHENTICATED`           | 401  | Missing or invalid session                                     |
| `FORBIDDEN`                 | 403  | Role not permitted                                             |
| `NOT_FOUND`                 | 404  | Missing, or caller cannot see it                               |
| `CONFLICT`                  | 409  | Idempotency key reused with a different body                   |
| `BOOKING_OVERLAP`           | 409  | Vehicle already booked in the period                           |
| `QUOTE_EXPIRED`             | 422  | Quote past `expires_at`                                        |
| `INVALID_STATUS_TRANSITION` | 422  | Transition not in the table                                    |
| `DOCUMENTS_NOT_VERIFIED`    | 422  | Booking cannot become `ready`                                  |
| `PAYMENT_FAILED`            | 422  | Provider declined                                              |
| `APPROVAL_REQUIRED`         | 422  | Amount above approval limit; approver needed                   |
| `RATE_LIMITED`              | 429  | Too many requests; `Retry-After` set                           |
| `INTERNAL_ERROR`            | 500  | Unexpected; logged to Sentry with request id                   |

## 4. Public endpoints

### GET /classes

Query: `city` (slug, optional), `from` and `to` (ISO dates, optional), `currency` (`KES`, `USD`, `EUR`; display only). Response `data[]`: `id`, `name`, `seats`, `best_for[]`, `price_per_day_kes`, `price_per_day_display`, `available_count` (when dates given), `image_url`.

### GET /classes/{id}

Response: class detail, `included[]`, `specs`, `photos[]`, `rating` (null until threshold met), `review_count`.

### GET /locations

Response `data[]`: `id`, `name`, `type`, `address`, `latitude`, `longitude`, `entrance_note`, `slug`.

### POST /quotes

Rate-limited. Body:

```json
{
  "class_id": "uuid",
  "start_at": "2026-11-20T08:00:00+03:00",
  "end_at": "2026-11-23T18:00:00+03:00",
  "handover": {
    "type": "delivery",
    "address": "string",
    "window_start": "ISO",
    "window_end": "ISO"
  },
  "pickup_location_id": "uuid or null",
  "extras": ["uuid"]
}
```

Rules: `end_at` after `start_at`; `start_at` not in the past; `handover.type` is `office` or `delivery`; delivery requires an address and window.

Response `201`: `id`, `expires_at`, `breakdown[]` (label, amount\_kes), `total_kes`, `deposit_kes`, `balance_kes`, `availability` (true or false).

### GET /availability

Query: `class_id`, `start_at`, `end_at`. Response: `available_count`.

### POST /enquiries

Body: `name` (required), `phone` (required, E.164), `message` (max 1000), `source` (`whatsapp`, `phone`, `form`). Response `201`: `id`.

## 5. Customer endpoints

### POST /bookings

Body: `quote_id`, `customer` (`full_name`, `phone`, `email`, optional `company_id`). Creates a booking in `pending_payment` and holds the vehicle until the quote's hold expires. Response `201`: `id`, `reference`, `status`, `payment_url` (Tingg checkout). Errors: `QUOTE_EXPIRED`, `BOOKING_OVERLAP`.

### GET /bookings

Query: `status` (optional), `limit`, `cursor`. Own bookings only.

### GET /bookings/{id}

Response: booking, `timeline[]` (status events mapped to the timeline steps), `documents[]` (type and status, no file paths), `handover`, `payments[]`.

### POST /bookings/{id}/cancel

Body: `reason` (optional), `acknowledged_no_refund` (required true when inside the no-refund window). Response: `status`, `refund_kes`, `policy_window`.

### PATCH /bookings/{id}

Body: any of `start_at`, `end_at`, `handover`. Re-prices; returns the new breakdown. Errors: `BOOKING_OVERLAP`, `APPROVAL_REQUIRED`.

### POST /bookings/{id}/payments

Body: `kind` (`deposit` or `balance`). Response: `payment_url`, `amount_kes`.

### POST /documents

Body: `type`, `booking_id` (optional), `content_type`, `size_bytes` (max 10 MB). Response `201`: `id`, `upload_url` (signed, short-lived).

### GET /documents/{id}/url

Response: `url` valid for 10 minutes. Owner only.

### GET /me

Response: profile, `company` (if any), `role`.

## 6. Staff endpoints

### GET /staff/bookings

Query: `status`, `date`, `handover_type`, `limit`, `cursor`.

### POST /staff/bookings

Body: `enquiry_id` (optional), `quote_id` or quote fields, `customer`, `vehicle_id` (optional). Records the actor. Response `201`.

### PATCH /staff/bookings/{id}/status

Body: `to_status`, `note` (required for `cancelled` and `expired`). Enforces the transition table; writes the status event in the same transaction. Errors: `INVALID_STATUS_TRANSITION`, `DOCUMENTS_NOT_VERIFIED`.

### POST /staff/bookings/{id}/assign

Body: `vehicle_id`, `driver_id` (required for delivery). Runs the overlap check.

### PATCH /staff/documents/{id}

Body: `status` (`verified` or `rejected`), `rejection_reason` (required when rejected). Records reviewer and time.

### GET /staff/documents/{id}/url

Body: `reason` (required). Returns a 10-minute URL. Writes to `document_access_log`.

### GET /staff/deliveries

Query: `date` (required). Response: deliveries for the day, ordered by window start.

### PATCH /staff/deliveries/{id}

Body: `status`, `checklist` (object). Handover record created on `completed`.

### POST /staff/handover-records

Body: `booking_id`, `type` (`pickup` or `return`), `fuel_level`, `mileage_km`, `photo_paths[]`, `customer_signature_path`. Append-only.

## 7. Admin endpoints

| Method and path                    | Purpose                               | Notes                                           |
| ---------------------------------- | ------------------------------------- | ----------------------------------------------- |
| `PUT /admin/rates`                 | Set a rate from a date                | Overlap rejected by database; audit row written |
| `POST /admin/refunds/{id}/approve` | Approve refund                        | Not allowed for the requester                   |
| `PATCH /admin/vehicles/{id}`       | Change status                         | Audit row written                               |
| `PATCH /admin/settings/{key}`      | Change a feature flag or policy value | Validated per key                               |
| `GET /admin/reports/utilisation`   | Utilisation by vehicle and class      | Query: `from`, `to`                             |

## 8. Webhooks

### POST /webhooks/tingg

No session. Verifies provider signature before reading the payload. Stores the event by provider event id; repeats return `200` without re-processing. Returns `200` only after the change is saved; any other result causes Tingg to retry.

## 9. Rate limits

| Scope                       | Limit                           |
| --------------------------- | ------------------------------- |
| Public reads                | 120 requests per minute per IP  |
| `POST /quotes`              | 20 per minute per IP            |
| Login and OTP               | 5 per minute per phone or email |
| Write endpoints (signed in) | 60 per minute per user          |

## 10. Validation

Every route has one Zod schema in `schemas/`. The browser form imports the same schema. Schemas reject unknown fields.

## 11. Open questions

1. Whether public quotes require CAPTCHA at launch, or rate limits alone are enough.
2. Whether a guest can cancel a booking without an account, using the reference and phone number.
