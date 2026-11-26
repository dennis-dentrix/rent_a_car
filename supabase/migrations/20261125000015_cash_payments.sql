-- Renters pay the company at handover (docs/booking-flow-plan.md), often in cash. A new value of a type cannot be
-- used in the transaction that adds it, so it is added on its own.
alter type payment_method add value 'cash';
