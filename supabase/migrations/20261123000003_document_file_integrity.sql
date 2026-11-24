-- Two protections for identity documents.
--
-- 1. The version tag (ETag) of the stored file is saved when the API has checked the file's content. A
--    signed upload link stays valid for ten minutes, so without this a customer could replace the file
--    after it was checked or reviewed. The API refuses to open a file whose tag has changed. Only the
--    service role writes this column: customers' column grants on documents do not include it.
alter table documents add column file_etag text;

-- 2. Corporate users may see a booking's signed agreement, but not the ID or licence of the person who
--    rented. The policy covered every document of a company's booking.
alter policy documents_company on documents
  using (company_has_booking(booking_id) and type = 'agreement');
