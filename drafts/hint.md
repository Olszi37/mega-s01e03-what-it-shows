# booking-v3 prints a month-first date hint for day-first tenants (33 reports in #4471)

## Scope and count

The 2026-10-04 KB export contains **33 distinct reports** classified as `hint` in merged ticket #4471. These cover 3 tenants, received 2026-04-17 through 2026-09-22. This is an export count, not the live support queue.

## Problem

For a day-first tenant, booking-v3 prints `MM/DD/YYYY` under the date field, but the form interprets the entry in the tenant's day-first order. People follow the hint and enter a month-first date, which the form then reverses. This is a distinct problem from the shared parser's unconditional month-first reading.

Reproduce with a booking-v3 day-first tenant such as `alder.physio`: follow the printed hint and enter `08/06/2026` intending 6 August; the tenant-form path interprets it as 8 June. R-41241 reports that exact June/August reversal. R-41230 is another example, despite being intake-tagged parser.

## How the count was obtained

Deduplicate `reports-4471.json` by report ID, filter `mergedInto === 4471`, resolve each tenant's locale and form, and run the exported `causeOf` / `groupByCause`. The hint group is the day-first tenant + form channel + booking-v3 combination. Browser locale, subject and intake tag are not the classification rule. Intake tagged 18 of these reports hint and 15 parser. The other 379 distinct reports are accounted for in the parser issue. `evidence/audit.json` lists all assigned IDs.

## Proposed correction and verification

Generate the date-field hint from the same tenant-format rule that reads the input. Check all day-first booking-v3 tenants, booking-v2 controls, and month-first controls. Verify that following the displayed hint produces the intended date. Keep this issue separate so the parser fix cannot close it without correcting the form hint.
