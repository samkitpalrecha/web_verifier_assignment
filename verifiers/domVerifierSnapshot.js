import { JSDOM } from "jsdom";

export function verifyFromHtml(htmlString, constraints) {
  try {
    const dom = new JSDOM(htmlString);
    const doc = dom.window.document;

    const priceEl = doc.querySelector("[data-price]");
    const cityEl = doc.querySelector("[data-city]");
    const bedroomsEl = doc.querySelector("[data-bedrooms]");

    if (!priceEl || !cityEl || !bedroomsEl) {
      return {
        success: false,
        reason: "Required element missing in DOM",
        evidence: {
          missing: {
            price: !priceEl,
            city: !cityEl,
            bedrooms: !bedroomsEl
          }
        }
      };
    }

    const price = Number(priceEl.getAttribute("data-price"));
    const city = cityEl.textContent.trim();
    const bedrooms = Number(bedroomsEl.getAttribute("data-bedrooms"));

    const violations = [];

    if (price > constraints.maxPrice) violations.push("price");
    if (city.toLowerCase() !== constraints.city.toLowerCase()) violations.push("city");
    if (bedrooms !== constraints.bedrooms) violations.push("bedrooms");

    if (violations.length > 0) {
      return {
        success: false,
        reason: `Constraint violations: ${violations.join(", ")}`,
        evidence: { price, city, bedrooms, violations }
      };
    }

    return {
      success: true,
      reason: `All constraints satisfied: price ${price} ≤ ${constraints.maxPrice}, city '${city}', bedrooms ${bedrooms}`,
      evidence: {
        price,
        city,
        bedrooms,
        selectors: {
          price: "[data-price]",
          city: "[data-city]",
          bedrooms: "[data-bedrooms]"
        }
      }
    };

  } catch (err) {
    return {
      success: false,
      reason: "Failed to parse HTML",
      evidence: { error: err.message }
    };
  }
}
