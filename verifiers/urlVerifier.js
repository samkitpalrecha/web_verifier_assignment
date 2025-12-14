import { URL } from "url";

export function verifyGithubIssueSearch(finalUrl, constraints) {
  try {
    const url = new URL(finalUrl);

    const typeParam = url.searchParams.get("type");
    if (typeParam !== constraints.type) {
      return {
        success: false,
        reason: `Expected type=${constraints.type}, found ${typeParam}`,
        evidence: { type: typeParam }
      };
    }

    const rawQuery = url.searchParams.get("q") || "";
    const decodedQuery = decodeURIComponent(rawQuery).toLowerCase();

    const requiredTokens = [
      `repo:${constraints.repo}`,
      "is:issue",
      "is:open",
      `label:${constraints.label}`
    ];

    const tokensFound = requiredTokens.filter(t =>
      decodedQuery.includes(t)
    );

    if (tokensFound.length !== requiredTokens.length) {
      return {
        success: false,
        reason: "Missing required query tokens",
        evidence: {
          tokensFound,
          requiredTokens
        }
      };
    }

    return {
      success: true,
      reason: "URL query contains all required constraints",
      evidence: {
        repo: constraints.repo,
        type: constraints.type,
        tokensFound
      }
    };

  } catch (err) {
    return {
      success: false,
      reason: "Invalid URL",
      evidence: { error: err.message }
    };
  }
}