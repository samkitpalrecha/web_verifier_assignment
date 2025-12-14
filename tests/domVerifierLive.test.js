import { describe, it, expect, vi } from "vitest";
import puppeteer from "puppeteer";
import { verifyTajMahalPage } from "../verifiers/domVerifierLive.js";

vi.mock("puppeteer", () => {
  return {
    default: {
      launch: vi.fn()
    }
  };
});

describe("Live DOM Verifier (Task 2)", () => {
  it("passes when title and location are correct", async () => {
    const mockPage = {
      goto: vi.fn().mockResolvedValue(),
      $eval: vi.fn().mockResolvedValue("Taj Mahal"),
      evaluate: vi.fn().mockResolvedValue("Agra, Uttar Pradesh, India")
    };

    const mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn().mockResolvedValue()
    };

    puppeteer.launch.mockResolvedValue(mockBrowser);

    const result = await verifyTajMahalPage("https://example.com");

    expect(result.success).toBe(true);
    expect(result.evidence.pageTitle).toBe("Taj Mahal");
    expect(result.evidence.extractedLocation).toContain("Agra");
  });

  it("fails when title does not contain Taj Mahal", async () => {
    const mockPage = {
      goto: vi.fn().mockResolvedValue(),
      $eval: vi.fn().mockResolvedValue("Eiffel Tower"),
      evaluate: vi.fn()
    };

    const mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn().mockResolvedValue()
    };

    puppeteer.launch.mockResolvedValue(mockBrowser);

    const result = await verifyTajMahalPage("https://example.com");

    expect(result.success).toBe(false);
    expect(result.reason).toContain("Page title does not contain");
  });

  it("fails with network timeout", async () => {
    const timeoutError = new Error("Timeout");
    timeoutError.name = "TimeoutError";

    const mockPage = {
      goto: vi.fn().mockRejectedValue(timeoutError)
    };

    const mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn().mockResolvedValue()
    };

    puppeteer.launch.mockResolvedValue(mockBrowser);

    const result = await verifyTajMahalPage("https://example.com");

    expect(result.success).toBe(false);
    expect(result.reason).toBe("Network timeout");
  });
});