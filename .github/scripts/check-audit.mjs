// Runs `npm audit --json` and fails only on high/critical advisories that
// aren't explicitly allowlisted below. Plain `npm audit --audit-level=high`
// has no way to accept a specific advisory, so this exists to let CI reflect
// a deliberate, documented risk decision instead of going permanently red.
//
// Each allowlist entry must say why it's here and when to revisit it.
import { execSync } from "node:child_process";

// react-router-dom was bumped to ^7.18.1 to close these three advisories, but
// v7 wraps all navigation in React.startTransition unconditionally (v6 kept
// this behind an opt-in flag specifically because it breaks Suspense/lazy
// route trees like this app's). That caused a real production incident —
// navigation randomly hitting a genuine React render error, caught by
// ErrorBoundary — so react-router-dom is reverted to ^6.30.4 pending a more
// careful v7 migration. These entries are listed below (even though the two
// moderate ones fall under FAIL_SEVERITIES already and wouldn't fail CI on
// their own) so the accepted risk is documented in one place.
const ALLOWLIST = {
  "GHSA-qwww-vcr4-c8h2": {
    reason:
      "React Router RSC Mode CSRF Bypass. Only affects the unstable RSC APIs, " +
      "which this app does not use (plain BrowserRouter/Routes/Route). The " +
      "only available fix is react-router@8.3.0, which requires React 19 " +
      "(this app is on React 18.3.1) — a separate migration, not a dependency bump.",
    revisit: "When react-router-dom publishes a release compatible with the patched react-router, or when React 19 migration is planned.",
  },
  "GHSA-wrjc-x8rr-h8h6": {
    reason:
      "Open redirect via backslash in <Link>/useNavigate. Requires passing " +
      "untrusted, user-controlled input as a navigation target — this app " +
      "only ever navigates to static, hardcoded routes.",
    revisit: "If any route ever navigates to a dynamic/user-supplied target, or when react-router-dom v7 is safely re-adopted.",
  },
  "GHSA-337j-9hxr-rhxg": {
    reason:
      "Arbitrary constructor injection via deserializeErrors() during SSR " +
      "hydration. This app is client-rendered only (createRoot, no " +
      "hydrateRoot/SSR anywhere), so this code path is never reached.",
    revisit: "If server-side rendering is ever introduced, or when react-router-dom v7 is safely re-adopted.",
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
