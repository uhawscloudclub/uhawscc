import express from "express";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import { Resend } from "resend";
import { fetchMeetupEvents, getEventsWithCache } from "./server/meetupFeed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, "dist");
const indexHtml = path.join(distPath, "index.html");

// In production, fail fast if the build is missing.
// In dev (NODE_ENV=development or unset locally) we skip this check so
// `npm run dev:api` can serve the API-only without a built dist folder.
const isDev = process.env.NODE_ENV !== "production";

if (!isDev && !fs.existsSync(indexHtml)) {
  console.error(
    `ERROR: ${indexHtml} not found. Run "npm run build" before starting the server.`
  );
  process.exit(1);
}

// Trust the first proxy hop (e.g., Render's reverse proxy) so that
// express-rate-limit reads the real client IP from X-Forwarded-For
// instead of the proxy's IP, preventing all users from sharing one limit.
app.set("trust proxy", 1);

// Gzip compression for all responses
app.use(compression());

// Security headers — must come before static/routes so all responses are covered.
// CSP allows Google Fonts (styles + fonts CDN) since they're loaded from index.html.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://challenges.cloudflare.com",
          // The font-preload rel-swap inline <script> in index.html. Must stay
          // inline (not an external file) to attach its load listener before
          // the cross-origin font CSS fetch can finish — an external file
          // loses that race under real network latency and permanently
          // strands the fonts at rel="preload". Regenerate this hash if that
          // script's content ever changes.
          "'sha256-VXQXWUhgaCREDk52BHXsHGjzQONEvMmmqj+ET9X1C3M='",
        ],
        styleSrc: [
          "'self'",
          "https://fonts.googleapis.com",
          // sonner (toast lib) unconditionally injects its own <style> tag via
          // document.createElement("style") at module load — no config to
          // disable it. It does this in two steps (append an empty <style>,
          // then fill its text content), so both the empty-content hash and
          // the real-content hash are needed. Verified live against the
          // installed sonner@1.7.4. MUST be regenerated (check the browser
          // console's CSP violation message for the new hash) if sonner is
          // ever upgraded and its bundled CSS string changes.
          "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='", // sha256("") — the transient empty <style> tag
          "'sha256-Od9mHMH7x2G6QuoV3hsPkDCwIyqbg2DX3F5nLeCYQBc='", // sonner's actual injected CSS
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "https://challenges.cloudflare.com"],
        frameSrc: ["https://agentpierre.github.io", "https://challenges.cloudflare.com"], // News page iframe + Turnstile
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginEmbedderPolicy: false, // News page iframe (agentpierre.github.io) lacks CORP headers; COEP must stay off
  })
);

// Permissions-Policy — Helmet 8 dropped this header, so set it manually.
// Empty parens () deny the feature to all origins, including the page itself.
app.use((_req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  next();
});

// CORS — restrict origins now so any future route is secure by default.
// Update ALLOWED_ORIGINS with your production domain once deployed.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : false,
    methods: ["GET", "POST"],
  })
);

// Rate limit — applied globally before static assets so asset flooding is
// also covered. 300 req / 15 min is generous for a static SPA while still
// blocking automated scanners.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// Static assets — production only.
// In dev, Vite handles the frontend; Express only serves the API.
if (!isDev) {
  app.use(
    express.static(distPath, {
      maxAge: "1y",
      setHeaders(res, filePath) {
        if (path.basename(filePath) === "index.html") {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
      },
    })
  );
}

// ── Meetup events API ──────────────────────────────────────────────────────
// Fetches the public Meetup RSS feed, parses it, caches for 15 min.
// The browser always hits /api/events (same origin) so no CORS or CSP changes
// are needed — the outbound Meetup fetch is server-side only.
// Parsing, response validation, and cache policy live in server/meetupFeed.js
// so that decision logic is unit-testable without booting Express.
//
// Slug MUST stay in sync with EXTERNAL_LINKS.meetup in src/config/externalLinks.ts.
// These drifted when AWS renamed Cloud Clubs to Student Builder Groups: the old
// slug 404'd for months while this endpoint silently showed "no upcoming events".
const MEETUP_RSS =
  "https://www.meetup.com/aws-sbg-at-univ-of-houston/events/rss/";
const EVENTS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

let eventsCache = { data: null, fetchedAt: 0 };

// A store object (not a raw value) so getEventsWithCache always reads/writes
// the live module-level cache — required so a failed request's fallback
// reflects the current cache, not a snapshot from before its own fetch began.
// See the concurrency note on getEventsWithCache in server/meetupFeed.js.
const eventsCacheStore = {
  get: () => eventsCache,
  set: (next) => { eventsCache = next; },
};

/** Escape user-supplied strings before embedding in an HTML email body. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

app.get("/api/events", async (req, res) => {
  const result = await getEventsWithCache({
    cacheStore: eventsCacheStore,
    now: Date.now(),
    ttlMs: EVENTS_CACHE_TTL,
    fetchEvents: () => fetchMeetupEvents({ url: MEETUP_RSS }),
  });

  if (result.error) {
    console.error(
      "[/api/events]",
      result.stale ? "serving stale cache after error:" : "no usable cache, returning 503:",
      result.error instanceof Error ? result.error.message : String(result.error)
    );
  }

  res.status(result.status).json(result.body);
});

// ── Contact form API ───────────────────────────────────────────────────────
// Accepts POST { name, email, subject, message }, validates, sends email via
// Resend (HTTPS — avoids Render.com's SMTP port block).
// Set RESEND_API_KEY + optionally CONTACT_EMAIL_TO in Render env vars.

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 8,                    // max 8 submissions per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages sent. Please wait an hour and try again." },
});

app.use(express.json({ limit: "16kb" }));

app.post("/api/contact", contactLimiter, async (req, res) => {
  const { name, email, subject, message, _hp, cfToken } = req.body ?? {};

  // Honeypot — bots fill hidden fields, humans don't. Silently succeed so bots
  // think they got through and don't retry with a different strategy.
  if (typeof _hp === "string" && _hp.length > 0) {
    return res.json({ ok: true });
  }

  // Cloudflare Turnstile verification (skipped in dev if secret not set)
  const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;
  if (TURNSTILE_SECRET) {
    if (!cfToken || typeof cfToken !== "string") {
      return res.status(400).json({ error: "Please complete the bot check." });
    }
    try {
      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secret: TURNSTILE_SECRET, response: cfToken }),
        }
      );
      const { success } = await verifyRes.json();
      if (!success) {
        return res.status(400).json({ error: "Bot check failed. Please try again." });
      }
    } catch (err) {
      // Fail open — log and continue rather than blocking real users
      console.warn("[/api/contact] Turnstile verification error:", err instanceof Error ? err.message : String(err));
    }
  }

  // Server-side validation — length caps also prevent header-injection and ReDoS
  if (
    typeof name !== "string" || name.trim().length < 2 || name.length > 100 ||
    typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof subject === "string" && subject.length > 200 ||
    typeof message !== "string" || message.trim().length < 10 || message.length > 5000
  ) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }

  // Strip CR/LF from header-bound fields to prevent email header injection
  const safeName    = name.trim().replace(/[\r\n]/g, " ");
  const safeSubject = (subject || "").trim().replace(/[\r\n]/g, " ") || "New message from website";

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const CONTACT_TO    = process.env.CONTACT_EMAIL_TO || "uhawscloudclub@gmail.com";

  if (!RESEND_API_KEY) {
    if (isDev) {
      // Dev-only fallback: log and return success so the UX isn't broken locally.
      console.warn("[/api/contact] RESEND_API_KEY not set — message not sent.");
      console.info("[/api/contact] Message from:", email, "|", name, "|", subject?.trim() || "(no subject)");
      return res.json({ ok: true });
    }
    console.error("[/api/contact] RESEND_API_KEY not set in production.");
    return res.status(503).json({ error: "Contact form is temporarily unavailable. Please email us directly." });
  }

  try {
    const resend = new Resend(RESEND_API_KEY);

    // HTML-safe versions for email body
    const safeNameHtml    = escapeHtml(safeName);
    const safeEmailHtml   = escapeHtml(email.trim());
    const safeSubjectHtml = escapeHtml(safeSubject === "New message from website" ? "—" : safeSubject);
    const safeMessageHtml = escapeHtml(message.trim());

    const { error: resendError } = await resend.emails.send({
      from: "AWS Cloud Club UH <contact@cloudhubuh.com>",
      to: [CONTACT_TO],
      reply_to: `${safeName} <${email.trim()}>`,
      subject: `[Contact] ${safeSubject}`,
      text: [
        `Name:    ${safeName}`,
        `Email:   ${email.trim()}`,
        `Subject: ${safeSubject}`,
        ``,
        message.trim(),
      ].join("\n"),
      html: `
        <p><strong>Name:</strong> ${safeNameHtml}</p>
        <p><strong>Email:</strong> <a href="mailto:${safeEmailHtml}">${safeEmailHtml}</a></p>
        <p><strong>Subject:</strong> ${safeSubjectHtml}</p>
        <hr/>
        <p style="white-space:pre-wrap">${safeMessageHtml}</p>
      `,
    });

    if (resendError) throw new Error(resendError.message);

    res.json({ ok: true });
  } catch (err) {
    console.error("[/api/contact]", err instanceof Error ? err.message : String(err));
    res.status(500).json({ error: "Failed to send your message. Please email us directly." });
  }
});

// SPA fallback — production only
if (!isDev) {
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
