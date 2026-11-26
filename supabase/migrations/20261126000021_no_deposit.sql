-- No deposit is taken for now (owner, 23 November 2026), but the first migration shipped 30 percent, so quotes
-- still asked for one. An admin can set a percent again.
update settings set value = '0' where key = 'deposit_percent';
