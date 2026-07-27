// Runs `npm audit --json` and fails only on high/critical advisories that
// aren't explicitly allowlisted below. Plain `npm audit --audit-level=high`
// has no way to accept a specific advisory, so this exists to let CI reflect
// a deliberate, documented risk decision instead of going permanently red.
//
// Each allowlist entry must say why it's here and when to revisit it.
import { execSync } from "node:child_process";

const ALLOWLIST = {
  "GHSA-qwww-vcr4-c8h2": {
    reason:
      "React Router RSC Mode CSRF Bypass. Only affects the unstable RSC APIs, " +
      "which this app does not use (plain BrowserRouter/Routes/Route). The " +
      "only available fix is react-router@8.3.0, which requires React 19 " +
      "(this app is on React 18.3.1) — a separate migration, not a dependency bump.",
    revisit: "When react-router-dom publishes a release compatible with the patched react-router, or when React 19 migration is planned.",
  },
};

const FAIL_SEVERITIES = new Set(["high", "critical"]);

let report;
try {
  const raw = execSync("npm audit --json", { maxBuffer: 1024 * 1024 * 20 }).toString();
  report = JSON.parse(raw);
} catch (err) {
  // npm audit exits non-zero when vulnerabilities are found; stdout still has the JSON.
  const raw = err.stdout?.toString();
  if (!raw) {
    console.error("npm audit did not produce JSON output:", err.message);
    process.exit(1);
  }
  report = JSON.parse(raw);
}

const vulnerabilities = report.vulnerabilities ?? {};

// A vulnerability's `via` array mixes two shapes: advisory objects (with a
// GHSA `.url`) for direct findings, and plain package-name strings when the
// finding is purely transitive (e.g. react-router-dom's entry just says
// "react-router"). Resolve those name references to the advisory IDs of the
// package they point at, recursively, so the whole chain can be allowlisted.
function resolveAdvisoryIds(vuln, seenPkgs = new Set()) {
  const ids = new Set();
  for (const entry of vuln.via ?? []) {
    if (typeof entry === "object" && entry.url) {
      ids.add(entry.url.split("/").pop());
    } else if (typeof entry === "string" && vulnerabilities[entry] && !seenPkgs.has(entry)) {
      seenPkgs.add(entry);
      for (const id of resolveAdvisoryIds(vulnerabilities[entry], seenPkgs)) ids.add(id);
    }
  }
  return ids;
}

const unallowed = [];
const seenAllowlisted = new Set();

for (const [pkgName, vuln] of Object.entries(vulnerabilities)) {
  if (!FAIL_SEVERITIES.has(vuln.severity)) continue;

  const advisoryIds = [...resolveAdvisoryIds(vuln)];

  if (advisoryIds.length === 0) {
    // No advisory IDs to check against the allowlist — treat conservatively as unallowed.
    unallowed.push({ pkgName, severity: vuln.severity, advisoryIds: [] });
    continue;
  }

  const allAllowlisted = advisoryIds.every((id) => id in ALLOWLIST);
  if (allAllowlisted) {
    advisoryIds.forEach((id) => seenAllowlisted.add(id));
  } else {
    unallowed.push({ pkgName, severity: vuln.severity, advisoryIds });
  }
}

if (seenAllowlisted.size > 0) {
  console.log("Allowlisted advisories present (accepted risk):");
  for (const id of seenAllowlisted) {
    console.log(`  - ${id}: ${ALLOWLIST[id].reason}`);
    console.log(`    Revisit: ${ALLOWLIST[id].revisit}`);
  }
}

if (unallowed.length > 0) {
  console.error("\nHigh/critical vulnerabilities found that are NOT allowlisted:");
  for (const { pkgName, severity, advisoryIds } of unallowed) {
    console.error(`  - ${pkgName} (${severity}): ${advisoryIds.join(", ") || "no advisory URL"}`);
  }
  console.error("\nRun `npm audit` for full details, then either fix them or add a justified allowlist entry.");
  process.exit(1);
}

console.log("\nNo unallowlisted high/critical vulnerabilities found.");
