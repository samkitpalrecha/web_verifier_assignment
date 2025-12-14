# Web Verifier Assignment

A Node.js project with three verifiers that validate URLs and DOM content.

## Tech Stack

- **Runtime:** Node.js (ESM modules)
- **Task 1:** Native URL API
- **Task 2:** Puppeteer (headless browser)
- **Task 3:** JSDOM (DOM parser, no network)
- **Testing:** Vitest

## Setup

```bash
npm install
```

## What Each Verifier Does

### Task 1: URL Verifier

**File:** `verifiers/urlVerifier.js`  
**Function:** `verifyGithubIssueSearch(url, constraints)`

Checks if a GitHub search URL contains all required query parameters. 

**Example:**
```javascript
import { verifyGithubIssueSearch } from './verifiers/urlVerifier.js';

const result = verifyGithubIssueSearch(
  'https://github.com/search?q=repo%3Amicrosoft%2Fplaywright+is%3Aissue+is%3Aopen+label%3Abug&type=issues',
  { repo: 'microsoft/playwright', type: 'issues', label: 'bug' }
);

console.log(result);
// { success: true, reason: ".. .", evidence: { ... } }
```

**What it checks:**
- `type` query param equals `issues`
- `q` contains `repo:microsoft/playwright`
- `q` contains `is:issue`
- `q` contains `is:open`
- `q` contains `label:bug`

---

### Task 2: Live DOM Verifier

**File:** `verifiers/domVerifierLive.js`  
**Function:** `verifyTajMahalPage(url)`

Opens a real webpage with Puppeteer and extracts DOM data.

**Example:**
```javascript
import { verifyTajMahalPage } from './verifiers/domVerifierLive.js';

const result = await verifyTajMahalPage('https://en.wikipedia.org/wiki/Taj_Mahal');
console.log(result);
// { success: true, reason: "...", evidence: { pageTitle, extractedLocation, selectors } }
```

**What it checks:**
- Page title contains "Taj Mahal"
- Infobox location contains "Agra"

**Selectors** (from `config/selectors.json`):
- Title: `h1#firstHeading`
- Infobox rows:  `.infobox tr`
- Looks for row where header contains "Location"

---

### Task 3: Snapshot DOM Verifier

**File:** `verifiers/domVerifierSnapshot.js`  
**Function:** `verifyFromHtml(htmlString, constraints)`

Parses HTML string (no network) with JSDOM and checks constraints.

**Example:**
```javascript
import fs from 'fs';
import { verifyFromHtml } from './verifiers/domVerifierSnapshot. js';

const html = fs. readFileSync('snapshots/snapshot_listing.html', 'utf-8');
const result = verifyFromHtml(html, { maxPrice: 3000, city: 'Pune', bedrooms: 2 });

console.log(result);
// { success: true, reason: "...", evidence: { price, city, bedrooms, selectors } }
```

**What it checks:**
- Price ≤ 3000
- City equals "Pune" (case-insensitive)
- Bedrooms equals 2

**Selectors:**
- Price: `[data-price]`
- City: `[data-city]`
- Bedrooms: `[data-bedrooms]`

---

## Running Tests

```bash
npm test
```

Uses Vitest to run unit tests in the `tests/` directory.

---

## Expected Results

### Task 1 URLs

| URL | Expected |
|-----|----------|
| `repo%3Amicrosoft%2Fplaywright+is%3Aissue+is%3Aopen+label%3Abug&type=issues` | ✅ PASS |
| `repo%3Amicrosoft%2Fplaywright+is%3Apr&type=issues` | ❌ FAIL |
| `repo%3Amicrosoft%2Fplaywright+is%3Aissue+label%3Adocumentation&type=issues` | ❌ FAIL |

### Task 2 URLs

| URL | Expected |
|-----|----------|
| `https://en.wikipedia.org/wiki/Taj_Mahal` | ✅ PASS |
| `https://en.wikipedia.org/wiki/Eiffel_Tower` | ❌ FAIL |
| `https://en.wikipedia.org/wiki/Agra` | ❌ FAIL |

### Task 3 Snapshots

| File | Expected | Reason |
|------|----------|--------|
| `snapshots/snapshot_listing.html` | ✅ PASS | Price=2800, City=Pune, Bedrooms=2 |
| `snapshots/snapshot_listing_fail.html` | ❌ FAIL | Price=4500, City=Mumbai, Bedrooms=3 |

---

## Error Handling

All verifiers return: 
- `{ success: false, reason: ".. .", evidence: { ...  } }` on failure
- `{ success: true, reason: "...", evidence: { ... } }` on success

**Common error cases:**
- Invalid URL → "Invalid URL"
- Page load timeout → "Network timeout"
- Element not found → "Required element missing in DOM"
- Failed HTML parse → "Failed to parse HTML"

---

## Key Assumptions

- **Task 1:** Token order in URL doesn't matter; only checks if required tokens exist in decoded query string
- **Task 2:** Puppeteer needs browser binaries (installed via `npm install`)
- **Task 3:** HTML must have `[data-price]`, `[data-city]`, `[data-bedrooms]` attributes
- Selectors are configurable in `config/selectors.json`