/**
 * Meetup events feed — parsing, response validation, and cache policy.
 *
 * Extracted out of server.js so the decision logic behind GET /api/events
 * (what counts as a valid feed, and when to serve fresh/stale/503) is a pure,
 * importable unit that tests can exercise directly — via the same functions
 * the route handler calls — instead of re-implementing the policy in a test
 * file or requiring a live Express server / network call.
 */

import { XMLValidator, XMLParser } from "fast-xml-parser";

const xmlParser = new XMLParser();

/** Extract the text content of the first occurrence of <tag>…</tag>,
 *  stripping CDATA wrappers. Safe for Meetup's RSS format. */
function rssField(block, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = re.exec(block);
  if (!m) return "";
  const val = m[1].trim();
  const cdata = val.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return cdata ? cdata[1].trim() : val;
}

/** Strip HTML tags and collapse whitespace for clean descriptions. */
function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Decide whether an upstream response is actually usable as Meetup's RSS
 * feed, before anything gets parsed or cached: a non-OK HTTP status, an
 * obvious HTML page (Meetup/CDN error or rate-limit page), and — via
 * fast-xml-parser — genuinely malformed XML (bad nesting, truncation) or a
 * document that's well-formed XML but isn't RSS with a <channel>. This is
 * XML *well-formedness* checking, not XML-schema validation — it doesn't
 * verify the document conforms to the RSS 2.0 spec beyond having a
 * <rss>/<channel> root, only that it's parseable and shaped like one.
 */
export function validateFeedResponse({ ok, status, contentType, body }) {
  if (!ok) {
    return { valid: false, reason: `upstream returned HTTP ${status}` };
  }

  const type = String(contentType ?? "").toLowerCase();
  if (type.includes("html")) {
    return { valid: false, reason: `unexpected content-type "${contentType}"` };
  }

  const trimmed = String(body ?? "").trim();
  if (/^<!doctype html/i.test(trimmed) || /<html[\s>]/i.test(trimmed)) {
    return { valid: false, reason: "response body looks like an HTML page, not RSS" };
  }

  // Real XML well-formedness check (not a regex approximation) — catches
  // invalid nesting like "<rss><channel></rss></channel>" and truncated/
  // cut-off responses (e.g. a connection dropped mid-transfer), neither of
  // which a mere "does it contain these opening tags" check can detect.
  // Crucially, it also correctly ignores angle-bracket-shaped text that's
  // just CDATA content, not markup — a naive tag-counting regex can't tell
  // the difference and would misfire on a feed whose description happens to
  // mention "<item>" as plain text.
  const wellFormed = XMLValidator.validate(trimmed);
  if (wellFormed !== true) {
    const detail = wellFormed?.err?.msg;
    return { valid: false, reason: detail ? `not well-formed XML: ${detail}` : "not well-formed XML" };
  }

  let parsed;
  try {
    parsed = xmlParser.parse(trimmed);
  } catch {
    return { valid: false, reason: "response body could not be parsed as XML" };
  }

  if (!parsed?.rss || typeof parsed.rss !== "object" || !parsed.rss.channel) {
    return { valid: false, reason: "response body is missing a recognizable <rss>/<channel> structure" };
  }

  return { valid: true };
}

// Matches "/<group-slug>/events/<event-id>/" (trailing slash optional) — an
// actual Meetup event-DETAIL page. Deliberately stricter than "contains
// /events/", which would also accept a group's event-LIST page with no
// specific event (".../events/" with nothing after it) as if it were a
// valid RSVP destination.
const MEETUP_EVENT_PATH_RE = /^\/[^/]+\/events\/[^/]+\/?$/;

/**
 * Accepts only an absolute HTTPS Meetup event-detail URL — never a substring
 * or prefix match, since e.g. "https://evil.com/?u=meetup.com" or
 * "https://www.meetup.com.evil.com/..." would pass a naive .includes()/
 * .startsWith() check but are not Meetup. Used to validate both <link> and
 * a <guid> fallback before either is trusted as an RSVP destination.
 */
export function isMeetupEventUrl(candidate) {
  if (!candidate) return false;
  let url;
  try {
    url = new URL(candidate);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (url.hostname !== "www.meetup.com" && url.hostname !== "meetup.com") return false;
  if (!MEETUP_EVENT_PATH_RE.test(url.pathname)) return false;
  return true;
}

/** Parse Meetup RSS XML into a structured array of events. */
export function parseRSS(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m;

  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const title = rssField(block, "title");
    const rawLink = rssField(block, "link");
    const rawGuid = rssField(block, "guid");
    const rawDescription = rssField(block, "description");
    // Only trust an absolute HTTPS Meetup event URL as the RSVP destination —
    // a non-URL guid (e.g. a bare id) would otherwise resolve as a relative
    // link on our own site, and an unvalidated link could point anywhere.
    const link = isMeetupEventUrl(rawLink) ? rawLink : (isMeetupEventUrl(rawGuid) ? rawGuid : "");
    const guid = rawGuid || link;

    if (!title || !link) continue;

    // Meetup's /events/rss/ only surfaces upcoming events — trust the feed.
    // pubDate is the *publication* date (when it was posted), NOT the event date,
    // so we do NOT use it to filter upcoming vs past, or to derive the date shown.
    const status = "upcoming";

    // Try to extract the real event date from the description text.
    // Meetup descriptions consistently mention dates like "April 20th" or "April 20, 2026".
    const plainDesc = stripHtml(rawDescription);
    const dateMatch = plainDesc.match(
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?/i
    );
    let date = "See Meetup for date & time";
    let rawDate = null;
    if (dateMatch) {
      const year = dateMatch[3] || new Date().getFullYear();
      // Parse at noon Central time to avoid midnight-UTC shifting the date by one day
      // when toLocaleDateString is called with America/Chicago timezone.
      const parsed = new Date(`${dateMatch[1]} ${dateMatch[2]}, ${year} 12:00:00 GMT-0500`);
      if (!isNaN(parsed.getTime())) {
        rawDate = parsed.toISOString();
        date = parsed.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "America/Chicago",
        });
      }
    }

    const description = plainDesc.slice(0, 200).trimEnd();

    items.push({
      id: guid,
      title,
      link,
      date,
      rawDate,
      description: description
        ? description.length === 200
          ? description + "…"
          : description
        : "See Meetup for details.",
      status,
    });
  }

  // Sort chronologically by extracted event date
  return items.sort((a, b) => {
    const da = a.rawDate ? new Date(a.rawDate) : 0;
    const db = b.rawDate ? new Date(b.rawDate) : 0;
    return da - db;
  });
}

/** Fetch and validate the Meetup RSS feed, returning parsed events or throwing. */
export async function fetchMeetupEvents({ url, fetchImpl = fetch, timeoutMs = 8000 }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      signal: controller.signal,
      headers: { "User-Agent": "AWS-Cloud-Club-UH-Website/1.0" },
    });
    const contentType = response.headers?.get?.("content-type") ?? "";
    const body = await response.text();

    const validation = validateFeedResponse({
      ok: response.ok,
      status: response.status,
      contentType,
      body,
    });
    if (!validation.valid) {
      throw new Error(`Invalid Meetup feed response: ${validation.reason}`);
    }

    return parseRSS(body);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Resolves the response for GET /api/events against a shared cache store.
 * `cacheStore` is `{ get(), set(next) }` over the caller's real cache state
 * (not a value snapshot) — the only side effects are `cacheStore.get()`/
 * `.set()` and the injected `fetchEvents()` call, so tests can substitute a
 * fake store and fetch to exercise every branch, including two concurrent
 * calls sharing one store, without a live network call or an Express server.
 *
 * Reading and writing through get()/set() (rather than passing a cache value
 * in and returning one out) is what makes this safe under concurrency: two
 * requests can be in flight against an expired cache at once, and a request
 * that fails must fall back to whatever is CURRENTLY in the store at that
 * moment — not the snapshot it happened to see when it started — otherwise a
 * slow failing request can stomp a fast successful one's update once it
 * finally resolves.
 *
 * Policy:
 *  - A fresh cache hit (including a validly-cached empty array) is served as-is.
 *  - A successful fetch — even with zero events — replaces the cache and is a 200.
 *  - A failed/invalid fetch NEVER writes to the cache.
 *  - A failed/invalid fetch is served as stale data only if the cache *at the
 *    time of failure* has at least one usable event; otherwise it's a 503
 *    with an empty array.
 */
export async function getEventsWithCache({ cacheStore, now, ttlMs, fetchEvents }) {
  const fresh = cacheStore.get();
  if (Array.isArray(fresh.data) && now - fresh.fetchedAt < ttlMs) {
    return { status: 200, body: fresh.data };
  }

  try {
    const events = await fetchEvents();
    cacheStore.set({ data: events, fetchedAt: now });
    return { status: 200, body: events };
  } catch (error) {
    // Re-read here, not `fresh` from above — another in-flight request may
    // have already refreshed the shared cache while this fetch was pending.
    const current = cacheStore.get();
    const hasUsableStaleData = Array.isArray(current.data) && current.data.length > 0;
    if (hasUsableStaleData) {
      return { status: 200, body: current.data, stale: true, error };
    }
    return { status: 503, body: [], error };
  }
}
