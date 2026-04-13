import express from "express";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";

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
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        frameSrc: ["https://agentpierre.github.io"], // News page iframe
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginEmbedderPolicy: false, // allow external images (og:image, team headshots)
  })
);

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

const MEETUP_RSS =
  "https://www.meetup.com/aws-cloud-club-at-univ-of-houston/events/rss/";
const EVENTS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

let eventsCache = { data: null, fetchedAt: 0 };

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

/** Escape user-supplied strings before embedding in an HTML email body. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

/** Parse Meetup RSS XML into a structured array of events. */
function parseRSS(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m;

  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const title = rssField(block, "title");
    const link = rssField(block, "link") || rssField(block, "guid");
    const rawDescription = rssField(block, "description");
    const pubDate = rssField(block, "pubDate");
    const guid = rssField(block, "guid") || link;

    if (!title || !link) continue;

    // Meetup's /events/rss/ only surfaces upcoming events — trust the feed.
    // pubDate is the *publication* date (when it was posted), NOT the event date,
    // so we do NOT use it to filter upcoming vs past.
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
      const parsed = new Date(`${dateMatch[1]} ${dateMatch[2]}, ${year}`);
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

app.get("/api/events", async (req, res) => {
  try {
    const now = Date.now();

    // Serve from cache if still fresh
    if (eventsCache.data && now - eventsCache.fetchedAt < EVENTS_CACHE_TTL) {
      return res.json(eventsCache.data);
    }

    // Fetch RSS with an 8-second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let xml;
    try {
      const response = await fetch(MEETUP_RSS, {
        signal: controller.signal,
        headers: { "User-Agent": "AWS-Cloud-Club-UH-Website/1.0" },
      });
      if (!response.ok) throw new Error(`Meetup RSS returned ${response.status}`);
      xml = await response.text();
    } finally {
      clearTimeout(timeout);
    }

    const events = parseRSS(xml);
    eventsCache = { data: events, fetchedAt: now };

    res.json(events);
  } catch (err) {
    console.error("[/api/events]", err instanceof Error ? err.message : String(err));
    // Return stale cache if available rather than a hard error
    if (eventsCache.data) return res.json(eventsCache.data);
    res.status(503).json([]);
  }
});

// ── Contact form API ───────────────────────────────────────────────────────
// Accepts POST { name, email, subject, message }, validates, sends email via
// Gmail SMTP (app password). Set CONTACT_EMAIL_USER + CONTACT_EMAIL_PASS in
// your Render.com environment variables before deploying.

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 8,                    // max 8 submissions per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages sent. Please wait an hour and try again." },
});

app.use(express.json({ limit: "16kb" }));

app.post("/api/contact", contactLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body ?? {};

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

  const CONTACT_USER = process.env.CONTACT_EMAIL_USER;
  const CONTACT_PASS = process.env.CONTACT_EMAIL_PASS;
  const CONTACT_TO   = process.env.CONTACT_EMAIL_TO || "uhawscloudclub@gmail.com";

  if (!CONTACT_USER || !CONTACT_PASS) {
    if (isDev) {
      // Dev-only fallback: log and return success so the UX isn't broken locally.
      console.warn("[/api/contact] Email credentials not set — message not sent.");
      console.info("[/api/contact] Message from:", email, "|", name, "|", subject?.trim() || "(no subject)");
      return res.json({ ok: true });
    }
    // In production, missing credentials is a misconfiguration — don't silently drop.
    console.error("[/api/contact] CONTACT_EMAIL_USER / CONTACT_EMAIL_PASS not set in production.");
    return res.status(503).json({ error: "Contact form is temporarily unavailable. Please email us directly." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: CONTACT_USER, pass: CONTACT_PASS },
    });

    // HTML-safe versions for email body
    const safeNameHtml    = escapeHtml(safeName);
    const safeEmailHtml   = escapeHtml(email.trim());
    const safeSubjectHtml = escapeHtml(safeSubject === "New message from website" ? "—" : safeSubject);
    const safeMessageHtml = escapeHtml(message.trim());

    await transporter.sendMail({
      from: `"AWS Cloud Club UH — Contact" <${CONTACT_USER}>`,
      to: CONTACT_TO,
      replyTo: `"${safeName}" <${email.trim()}>`,
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
