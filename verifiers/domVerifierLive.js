import puppeteer from "puppeteer";

// import selectors from "../config/selectors.json" assert { type: "json" };

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const selectors = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../config/selectors.json"),
    "utf-8"
  )
);

export async function verifyTajMahalPage(url) {
  let browser;

  try {
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000
    });

    // Title extraction
    const pageTitle = await page.$eval(
      selectors.wikipedia.title,
      el => el.textContent.trim()
    );

    if (!pageTitle.toLowerCase().includes("taj mahal")) {
      await browser.close();
      return {
        success: false,
        reason: "Page title does not contain 'Taj Mahal'",
        evidence: { pageTitle }
      };
    }

    // Infobox Location extraction
    const location = await page.evaluate(
      ({ infoboxRows, locationHeaderText }) => {
        const rows = document.querySelectorAll(infoboxRows);

        for (const row of rows) {
          const th = row.querySelector("th");
          const td = row.querySelector("td");

          if (
            th &&
            td &&
            th.textContent
              .toLowerCase()
              .includes(locationHeaderText.toLowerCase())
          ) {
            return td.textContent.trim();
          }
        }

        return null;
      },
      {
        infoboxRows: selectors.wikipedia.infoboxRows,
        locationHeaderText: selectors.wikipedia.locationHeaderText
      }
    );

    if (!location || !location.toLowerCase().includes("agra")) {
      await browser.close();
      return {
        success: false,
        reason: "Infobox location does not contain 'Agra'",
        evidence: { extractedLocation: location }
      };
    }

    await browser.close();
    return {
      success: true,
      reason: "Page title contains 'Taj Mahal' and location contains 'Agra'",
      evidence: {
        pageTitle,
        extractedLocation: location,
        selectors: {
          title: selectors.wikipedia.title,
          infoboxRows: selectors.wikipedia.infoboxRows,
          locationHeaderText: selectors.wikipedia.locationHeaderText
        }
      }
    };

  } catch (err) {
    if (err.name === "TimeoutError") {
      return {
        success: false,
        reason: "Network timeout",
        evidence: { url }
      };
    }

    return {
      success: false,
      reason: "Failed to load page",
      evidence: { error: err.message }
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}