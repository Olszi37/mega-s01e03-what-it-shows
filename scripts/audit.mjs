import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { groupByCause, uniqueById, causeOf } from '../src/lib/kb/causes.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const raw = read('src/lib/data/reports-4471.json');
const tenants = fs.readdirSync(path.join(root, 'src/lib/data/tenants'))
  .map(p => read(`src/lib/data/tenants/${p}`));
const tenantOf = r => tenants.find(t => t.handle === r.tenant);
const unique = uniqueById(raw);
const merged = unique.filter(r => r.mergedInto === 4471);
const notes = read('src/lib/data/desk-notes.json');
const conflicts = [...new Set(raw.map(r => r.id))].filter(id =>
  new Set(raw.filter(r => r.id === id).map(r => JSON.stringify(r))).size > 1);
const groups = groupByCause(merged, tenantOf);
const result = {
  scope: 'Local export dated 2026-10-04; not a live queue count',
  rawRows: raw.length,
  distinctReports: unique.length,
  duplicateRows: raw.length - unique.length,
  conflictingDuplicateIds: conflicts,
  mergedReports: merged.length,
  groups: groups.map(({ reports, ...group }) => ({
    ...group, count: reports.length, ids: reports.map(r => r.id),
    channels: Object.fromEntries(['app', 'email', 'form'].map(c => [c, reports.filter(r => r.channel === c).length])),
    tenantHandles: [...new Set(reports.map(r => r.tenant))].sort(),
    intakeDisagreements: reports.filter(r => r.meta.intakeTag !== group.cause).map(r => r.id)
  })),
  oneDayReports: merged.filter(r => notes.oneDayMove.includes(r.id)).map(r => ({
    ...r, classifiedAs: causeOf(r, tenantOf(r)), tenantProfile: tenantOf(r)
  }))
};
if (conflicts.length || groups.reduce((sum, g) => sum + g.reports.length, 0) !== merged.length)
  throw new Error('Report integrity or reconciliation failed');
fs.mkdirSync(path.join(root, 'evidence'), { recursive: true });
fs.writeFileSync(path.join(root, 'evidence/audit.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ ...result, groups: result.groups.map(({ ids, intakeDisagreements, ...g }) =>
  ({ ...g, intakeDisagreements: intakeDisagreements.length })), oneDayReports: result.oneDayReports.map(r => r.id) }, null, 2));
