-- Request to book (docs/booking-flow-plan.md). A new value of a type cannot be used in the transaction that adds it,
-- so the two are added on their own.
alter type booking_status add value 'requested';
alter type booking_status add value 'declined';
