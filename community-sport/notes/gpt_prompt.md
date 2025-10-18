# Prompt

My current program data is in JSON with nested objects (venue: {name, address, suburb, postcode, lat, lng}, schedule: [{day, start, end, frequency, startDate, endDate}], equipment: {provided: boolean, required: []}), but my LaunchProgramPage form creates different structures (schedule: {days: [], startHour, startMinute, endHour, endMinute, startDate}). I need to migrate 16 existing objects to Firestore and support new program creation. Should I normalize these into separate collections (venues, schedules) or keep everything embedded? How do I design a unified Firestore schema that handles both data formats while supporting my search function filters (sport, ageGroups array matching, cost ranges, accessibility array-contains queries)?


Great question—this is exactly the kind of place where Firestore’s “model-for-your-queries” mindset pays off. Here’s a pragmatic path that:

- keeps reads fast for your filters (sport, age, cost, accessibility),
- unifies your two incoming data shapes,
- and avoids Firestore’s query limits (e.g., multiple range fields / multiple `array-contains`).

------

# TL;DR recommendation

- **Keep schedules embedded** inside each program doc (they’re small and read together).
- **Use a `venues` collection** if venues are reused across programs—**and** embed a small **venue snapshot** in each program for fast display/query.
- Add **derived, index-friendly fields** for search: `ageBuckets`, `cost`, `days`, `features.*` booleans, and `searchPrefixes`.
- Normalize both old JSON and the LaunchProgramPage form into a **single `Program` schema** (below), using small transform functions.

------

# Unified Firestore schema (program-centric)

**Collection:** `programs/{programId}`

```
// Typescript-ish shape
type Program = {
  title: string
  sport: string                       // e.g. "swimming"
  description?: string

  // venue denormalization + reference
  venueRef?: DocumentReference        // to /venues/{venueId} (optional but recommended if venues are reused)
  venue: {                            // snapshot used for render & simple queries
    name: string
    address: string
    suburb: string
    postcode: string
    lat: number
    lng: number
  }

  // pricing: pick ONE numeric to filter on; keep range for display only
  cost: number                        // canonical single value for querying (e.g., lowest or typical price)
  costMin?: number
  costMax?: number
  currency?: "AUD" | "USD" | string

  // ages: use searchable buckets + optional numeric range for display
  ageBuckets: string[]                // e.g., ["5-7","8-10"] for array-contains-any
  minAge?: number
  maxAge?: number

  // accessibility: BOOLEAN FACETS (not array) to avoid the "two array-contains" limit
  features: {
    wheelchair?: boolean
    accessibleToilet?: boolean
    sensoryFriendly?: boolean
    parking?: boolean
    // add others you actually filter on
  }

  // schedule: embedded small list of patterns
  schedule: Array<{
    day: number                       // 0=Sun .. 6=Sat
    startMins: number                 // minutes since midnight (e.g., 9:30 -> 570)
    endMins: number
    frequency: "once" | "weekly" | "fortnightly"
    startDate?: Timestamp
    endDate?: Timestamp
  }>

  // derived fields to accelerate filters
  days: number[]                      // from schedule[].day for quick "programs on Mon" filters
  suburbLower: string                 // normalize for equality/prefix filters
  searchPrefixes: string[]            // for prefix search ("swim" → "swimming")—see generator below

  // misc
  createdAt: Timestamp
  updatedAt: Timestamp
  isActive: boolean
}
```

**Why this works**

- **Cost range filtering**: Firestore only supports **one** range field per query. Use a single numeric `cost` for filtering (`>=`, `<=`). Keep `costMin/costMax` for UI display if needed.
- **Age filtering**: instead of numeric overlaps (which would be two ranges), query with `array-contains-any` on **`ageBuckets`** (e.g., UI maps “Ages 5–7” to `"5-7"`).
- **Accessibility**: Firestore allows at most one `array-contains` per query. To combine with `ageBuckets`, use **boolean facets** in `features.*` so you can do `.where('features.wheelchair','==',true)` alongside your other filters.
- **Prefix search** (“swim” → “swimming”): use `searchPrefixes` + `array-contains`. (For real fuzzy/typo search, use Fuse.js on a candidate set or Algolia/Meilisearch later.)

------

# If you reuse venues

**Collection:** `venues/{venueId}`

```
type Venue = {
  name: string
  address: string
  suburb: string
  postcode: string
  lat: number
  lng: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

On program write, store **both** `venueRef` and the `venue` snapshot. If a venue changes, you can:

- run a one-off script to resync snapshots, **or**
- add a small Cloud Function trigger on `venues/*` updates to patch affected `programs` (denormalization sync).

------

# Transform both incoming shapes → unified `Program`

## 1) From your **legacy JSON** (already an array of schedule objects)

```
function fromLegacy(legacy: any): Partial<Program> {
  const venue = legacy.venue
  const schedule = (legacy.schedule || []).map((s: any) => ({
    day: toDayNumber(s.day), // map "Mon"|"Monday"|1 → 1..6
    startMins: toMins(s.start), // "09:30" → 570
    endMins: toMins(s.end),
    frequency: (s.frequency || 'weekly').toLowerCase(),
    startDate: toTs(s.startDate),
    endDate: toTs(s.endDate),
  }))

  return {
    title: legacy.title,
    sport: (legacy.sport || '').toLowerCase(),
    description: legacy.description || '',
    venue: {
      name: venue.name, address: venue.address, suburb: venue.suburb.toLowerCase(),
      postcode: venue.postcode, lat: venue.lat, lng: venue.lng
    },
    cost: pickCanonicalCost(legacy.costMin, legacy.costMax, legacy.cost),
    costMin: legacy.costMin ?? null, costMax: legacy.costMax ?? null,
    currency: legacy.currency || 'AUD',
    ageBuckets: toAgeBuckets(legacy.minAge, legacy.maxAge, legacy.ageGroups),
    minAge: legacy.minAge ?? null, maxAge: legacy.maxAge ?? null,
    features: toFeatures(legacy.accessibility),
    schedule,
    days: [...new Set(schedule.map((s:any) => s.day))],
    suburbLower: venue.suburb.toLowerCase(),
    searchPrefixes: buildSearchPrefixes([legacy.title, legacy.sport, venue.suburb]),
    isActive: legacy.isActive ?? true,
  }
}
```

## 2) From your **LaunchProgramPage form** (single pattern with `days: []`, times split)

```
function fromForm(form: any): Partial<Program> {
  const startMins = form.startHour * 60 + form.startMinute
  const endMins = form.endHour * 60 + form.endMinute
  const schedule = (form.days || []).map((d:number) => ({
    day: d,
    startMins,
    endMins,
    frequency: 'weekly' as const,
    startDate: toTs(form.startDate),
    endDate: toTs(form.endDate),
  }))

  return {
    title: form.title,
    sport: (form.sport || '').toLowerCase(),
    description: form.description || '',
    venue: {
      name: form.venue.name, address: form.venue.address, suburb: form.venue.suburb.toLowerCase(),
      postcode: form.venue.postcode, lat: form.venue.lat, lng: form.venue.lng
    },
    cost: pickCanonicalCost(form.costMin, form.costMax, form.cost),
    costMin: form.costMin ?? null, costMax: form.costMax ?? null,
    currency: form.currency || 'AUD',
    ageBuckets: toAgeBuckets(form.minAge, form.maxAge, form.ageGroups),
    minAge: form.minAge ?? null, maxAge: form.maxAge ?? null,
    features: toFeatures(form.accessibility), // map checkboxes → booleans
    schedule,
    days: form.days,
    suburbLower: form.venue.suburb.toLowerCase(),
    searchPrefixes: buildSearchPrefixes([form.title, form.sport, form.venue.suburb]),
    isActive: true,
  }
}
```

### Helpers

```
function toMins(hhmm: string): number {
  const [h,m] = hhmm.split(':').map(Number); return h*60 + m
}
function toTs(d?: string | Date) { return d ? Timestamp.fromDate(new Date(d)) : null }
function toDayNumber(d: string | number): number {
  if (typeof d === 'number') return d
  const map:any = {sun:0, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6}
  return map[d.slice(0,3).toLowerCase()]
}
// choose a single cost value for queries
function pickCanonicalCost(min?: number, max?: number, single?: number) {
  if (typeof single === 'number') return single
  if (typeof min === 'number') return min
  if (typeof max === 'number') return max
  return 0
}
// ageBuckets: use your UI’s buckets; example:
function toAgeBuckets(min?: number, max?: number, groups?: string[]): string[] {
  if (groups?.length) return groups.map(s => s.toLowerCase())
  // or compute from min/max into standard buckets like ["5-7","8-10"]
  return []
}
// map array of tags → feature booleans
function toFeatures(tags?: string[] = []) {
  const t = new Set(tags.map(s => s.toLowerCase()))
  return {
    wheelchair: t.has('wheelchair'),
    accessibleToilet: t.has('accessible-toilet'),
    sensoryFriendly: t.has('sensory-friendly'),
    parking: t.has('parking'),
  }
}
function buildSearchPrefixes(sources: (string|undefined)[], maxTokenLen = 12) {
  const tokens = sources
    .filter(Boolean)
    .flatMap(s => s!.toLowerCase().split(/[^a-z0-9]+/g))
    .filter(Boolean)
  const prefixes = new Set<string>()
  for (const tok of tokens) {
    for (let i=1;i<=Math.min(tok.length, maxTokenLen);i++) prefixes.add(tok.slice(0,i))
  }
  return Array.from(prefixes)
}
```

------

# Example queries (fast + indexable)

```
const q = query(
  collection(db, 'programs'),
  where('isActive', '==', true),

  // sport filter (optional)
  where('sport', '==', selectedSport),        // equality is cheap

  // ages: UI maps checkboxes to buckets; any-match
  where('ageBuckets', 'array-contains-any', selectedAgeBuckets), 

  // accessibility: facet booleans (can combine with ageBuckets + cost)
  where('features.wheelchair', '==', wheelchairOnly),

  // cost range (single field, so allowed)
  where('cost', '>=', minCost),
  where('cost', '<=', maxCost),

  // optional: day-of-week filter
  // where('days', 'array-contains', 1), // Monday

  limit(30)
)
```

**Prefix search (“swim” → “swimming”)**

```
const term = userTerm.trim().toLowerCase()
const q = query(
  collection(db, 'programs'),
  where('searchPrefixes', 'array-contains', term),
  limit(30)
)
```

> If you need **typo tolerance** (“swm” → “swimming”), layer **Fuse.js** on the 30–200 docs returned by the Firestore filters, or move to Algolia later.

------

# Migration plan for the 16 existing objects

1. Write a one-off script (Node + `firebase-admin`) that:
   - reads your legacy JSON,
   - transforms with `fromLegacy`,
   - writes to `/programs/{id}` (batch or chunked).
2. For venue reuse: create `/venues` first, capture `venueRef`, then copy the snapshot into each program.

**Minimal example (Node)**

```
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import legacy from './legacy_programs.json' assert { type: 'json' }

initializeApp({ credential: cert(process.env.GCLOUD_SA_JSON as any) })
const db = getFirestore()

async function run() {
  const batch = db.batch()
  for (const lp of legacy) {
    const data = fromLegacy(lp) // from helper above, tweak Timestamp import
    const id = lp.id || db.collection('programs').doc().id
    const ref = db.collection('programs').doc(id)
    batch.set(ref, { ...data, createdAt: Timestamp.now(), updatedAt: Timestamp.now() }, { merge: true })
  }
  await batch.commit()
  console.log('Migrated', legacy.length, 'programs')
}
run().catch(console.error)
```

------

# Indexes you’ll likely need

You’ll be prompted in the console, but plan for composites like:

- `isActive (==)`, `sport (==)`, `cost (range)`, `ageBuckets (array-contains-any)`
- Add `features.wheelchair (==)` (or whichever facet you actually use) to the same index when combining.

Array + range + equality in one query is fine; Firestore will ask for a composite index once.

------

# Security rules (sketch)

Mirror your query shapes; allow only fields you expect:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function isSignedIn() { return request.auth != null; }

    match /programs/{programId} {
      allow read: if true;
      allow write: if isSignedIn(); // tighten for admins as needed

      // Optional: validate shapes on write (samples)
      allow create, update: if
        request.resource.data.sport is string
        && request.resource.data.cost is number
        && request.resource.data.ageBuckets is list
        && request.resource.data.features is map;
    }

    match /venues/{venueId} {
      allow read: if true;
      allow write: if isSignedIn();
    }
  }
}
```

------

# Why not fully normalize schedules/venues?

- **Schedules**: usually <10 items per program, always read with the program → embedding is faster & cheaper.
- **Venues**: normalize if shared (so you can edit once) **but still embed** a snapshot in each program to avoid extra reads and to query by `suburbLower`.

------

# What I can do next (quick wins)

- Drop in the exact transform functions adjusted to **your field names**.
- Provide the **Vue 3 form → Program** mapper (with validation).
- List the **exact composite indexes** after you confirm which filters can combine in the same search UI.
- Add a **Fuse.js** layer for typo tolerance on the client if you want “fuzzy” beyond prefix.

If you paste one legacy item + one form payload (redact private bits), I’ll return the ready-to-run transform and a tiny migration script tailored to your project.