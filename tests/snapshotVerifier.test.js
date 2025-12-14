import { describe, it, expect } from "vitest";
import fs from "fs";
import { verifyFromHtml } from "../verifiers/domVerifierSnapshot.js";

const constraints = {
  maxPrice: 3000,
  city: "Pune",
  bedrooms: 2
};

describe("Snapshot DOM Verifier", () => {
  it("passes valid snapshot", () => {
    const html = fs.readFileSync("snapshots/snapshot_listing.html", "utf-8");
    expect(verifyFromHtml(html, constraints).success).toBe(true);
  });

  it("fails invalid snapshot", () => {
    const html = fs.readFileSync("snapshots/snapshot_listing_fail.html", "utf-8");
    expect(verifyFromHtml(html, constraints).success).toBe(false);
  });
});