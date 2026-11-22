-- The operator role: a user who works for a rental company listed on the platform (product pack section 25).
-- It is its own migration because Postgres does not allow a new enum value to be used in the transaction that
-- adds it, and the next migration uses it.
alter type user_role add value 'operator';
