# Shared parser reads day-first tenant dates as month-first (379 reports in #4471)

## Scope and count

The 2026-10-04 KB export contains **379 distinct reports** classified as `parser` in merged ticket #4471. These cover 11 tenants, received 2026-04-01 through 2026-10-04. This is an export count, not a claim about the current support queue.

## Problem

The shared parser reads every date month-first even when a tenant writes day-first. For example, a day-first tenant's `07/04/2026` (7 April) can become 4 July. The affected routes include app and email, plus forms without the separate booking-v3 hint mismatch.

Example evidence: R-41200 reports 7 April becoming 4 July; R-41203 reports 2 December becoming 12 February. Resolve tenant locale and form from `src/lib/data/tenants`, not the reporter's browser locale or subject.

## How the count was obtained

Deduplicate `reports-4471.json` by report ID, filter `mergedInto === 4471`, then run `groupByCause` from `src/lib/kb/causes.ts` using the exported tenant directory. The export has 427 rows / 412 unique IDs. Intake tagged 356 of these 379 as parser and 23 as hint; the intake tag is a guess. The separate form-hint issue covers the other 33 reports. `evidence/audit.json` lists every assigned ID.

## Important uncertainty

Five reports are counted here by the supplied classifier: R-41202, R-41209, R-41236, R-41344 and R-41620. Their bodies describe one-day shifts, regional differences, or an invite preceding a booking. This does not prove a month/day swap. Preserve their current accounting, but investigate original timestamps, timezone conversion, reminder timing and reproduction before treating them as confirmed parser failures. Do not double-count them as an established third cause.

## Proposed correction and verification

Parse against the tenant's declared input format, validate ambiguous dates, and keep date-only values independent from timestamp conversion. Verify day-first locales, ambiguous day/month pairs, app/email/booking-v2 routes, and month-first controls. Track the five anomalous reports separately during investigation. A parser change alone does not fix the booking-v3 hint.
