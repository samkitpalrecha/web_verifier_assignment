# web_verifier_assignment

Small collection of verifiers (URL verifier, DOM snapshot verifier, live DOM verifier) with tests.

---

## How to run

Prerequisites
- Node.js (recommended v18+)
- npm

Install dependencies
```bash
npm install
```

Run tests
```bash
# run all tests (uses Vitest in the repo tests)
npx vitest
# or if you have a script in package.json:
npm test
```

Run the snapshot verifier manually
- The snapshot verifier reads HTML strings and verifies constraints programmatically. You can run the test-suite (above) to exercise it, or create a small script that imports `verifyFromHtml`:

Example script (`scripts/runSnapshotVerifier.mjs`)
```js
import fs from "fs";
import { verifyFromHtml } from "../verifiers/domVerifierSnapshot.js";

const html = fs.readFileSync("snapshots/snapshot_listing.html", "utf-8");
const constraints = { maxPrice: 3000, city: "Pune", bedrooms: 2 };

console.log(verifyFromHtml(html, constraints));
```

Run the live DOM verifier manually
- The live DOM verifier uses Puppeteer to launch a browser and inspect a page (used for the Taj Mahal example). Run via a small script that imports `verifyTajMahalPage`. Puppeteer will download a compatible Chromium binary during `npm install`.

Example script (`scripts/runLiveVerifier.mjs`)
```js
import { verifyTajMahalPage } from "../verifiers/domVerifierLive.js";

(async () => {
  const res = await verifyTajMahalPage("https://en.wikipedia.org/wiki/Taj_Mahal");
  console.log(res);
})();
```

Notes
- Puppeteer is used in headless mode. If you need to observe the browser, change the launch options in `verifiers/domVerifierLive.js`.
- The tests mock Puppeteer for deterministic unit tests; real runs will open Chromium.

---

## Assumptions made

These are assumptions the code/tests make about inputs, environment and HTML structure:

- Tests and verifiers assume the repository has a Node environment and dependencies can be installed with npm.
- Snapshot verifier (domVerifierSnapshot.js):
  - The HTML snapshot uses data attributes to expose values:
    - price: element with attribute `data-price` (the value is numeric).
    - city: element with attribute `data-city` (textContent used).
    - bedrooms: element with attribute `data-bedrooms` (the value is numeric).
  - Constraints object passed to `verifyFromHtml` contains numeric `maxPrice`, string `city`, and numeric `bedrooms`.
  - Missing elements are treated as a verification failure with evidence indicating which were missing.
- Live DOM verifier (domVerifierLive.js):
  - The page to verify is a Wikipedia-style page where the main page title is available at `h1#firstHeading`.
  - The page contains an "infobox" with rows selectable by `.infobox tr` and a header cell (`th`) whose text includes "Location" (case-insensitive). The corresponding `td` contains the location text.
  - The verifier expects the page title to contain "Taj Mahal" (case-insensitive) and the infobox location to contain "Agra".
  - Network timeouts are handled specially: if Puppeteer throws a `TimeoutError`, the verifier returns success: false with reason "Network timeout".
- URL verifier:
  - Expects a GitHub search URL with query parameters in the `q` parameter and `type=issues`.
  - The verifier checks for search qualifiers in the `q` parameter such as:
    - `repo:<owner>/<repo>` (example in tests: `repo:microsoft/playwright`)
    - `is:issue` and `is:open`
    - `label:<label>` (example in tests: `label:bug`)
  - If required qualifiers (e.g., label) are missing the verifier flags the URL invalid.

---

## Selectors used + why

These are the selectors used in the verifiers and the rationale for choosing them.

1. Live DOM verifier (config/selectors.json)
   - `h1#firstHeading`
     - Why: This is the canonical title selector on Wikipedia pages; it reliably contains the page's main heading (page title). Used to confirm the page title contains "Taj Mahal".
   - `.infobox tr`
     - Why: Wikipedia uses an `.infobox` table for metadata. Selecting rows (`tr`) lets the verifier iterate rows and find the header cell (th) whose label matches the expected header text ("Location").
   - `locationHeaderText: "Location"`
     - Why: Instead of relying on a brittle selector for the exact location cell, the code looks for a `th` whose text includes "Location" and then reads the corresponding `td`. Matching by header text is more robust across small layout variations and localized attribute ordering.

   File: `config/selectors.json`
   ```json
   {
     "wikipedia": {
       "title": "h1#firstHeading",
       "infoboxRows": ".infobox tr",
       "locationHeaderText": "Location"
     }
   }
   ```

2. Snapshot DOM verifier (verifiers/domVerifierSnapshot.js)
   - `[data-price]`
     - Why: Data attributes are stable for machine-readable values in snapshots. Using `[data-price]` gives a deterministic way to find the listing price (and the attribute value is parsed as a number).
   - `[data-city]`
     - Why: City text is read from an element annotated with `data-city`. This avoids depending on presentation HTML (like class names) which may change.
   - `[data-bedrooms]`
     - Why: Number of bedrooms is stored as a machine-readable attribute and parsed to a number. Using a data attribute keeps the verification logic simple and resilient.

3. URL verifier (string/URL parsing)
   - Pattern / expectations:
     - The GitHub search URL is expected in the form:
       ```
       https://github.com/search?q=<qualifiers>&type=issues
       ```
     - Required qualifiers (example from tests):
       - `repo:microsoft/playwright`
       - `is:issue` and `is:open`
       - `label:bug`
   - Why: The verifier verifies that required search qualifiers exist in the `q` parameter query value. This is a more reliable way to ensure the user constructed the intended GitHub search link (instead of relying on fragile UI selectors).

---

## Tests and evidence

- Tests are located in the `tests/` directory:
  - `tests/snapshotVerifier.test.js` — snapshot verifier (uses `snapshots/` HTML files).
  - `tests/domVerifierLive.test.js` — live DOM verifier (mocks Puppeteer).
  - `tests/urlVerifier.test.js` — URL verifier.
- Test constraints (examples used in tests):
  - Snapshot constraints: `{ maxPrice: 3000, city: "Pune", bedrooms: 2 }`
  - URL verifier constraints example: `{ repo: "microsoft/playwright", type: "issues", label: "bug" }`