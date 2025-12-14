import { describe, it, expect } from "vitest";
import { verifyGithubIssueSearch } from "../verifiers/urlVerifier.js";

const constraints = {
  repo: "microsoft/playwright",
  type: "issues",
  label: "bug"
};

describe("URL Verifier", () => {
  it("passes valid URL", () => {
    const url =
      "https://github.com/search?q=repo:microsoft/playwright+is:issue+is:open+label:bug&type=issues";
    expect(verifyGithubIssueSearch(url, constraints).success).toBe(true);
  });

  it("fails when label is missing", () => {
    const url =
      "https://github.com/search?q=repo:microsoft/playwright+is:issue+is:open&type=issues";
    expect(verifyGithubIssueSearch(url, constraints).success).toBe(false);
  });
});