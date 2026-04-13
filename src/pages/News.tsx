import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import ScrollReveal from '@/components/ScrollReveal';
import { ArrowRight, ExternalLink, Newspaper } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/config/externalLinks';

const NewsPage = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <PageLayout intensity="low">

      {/* ── Header ── */}
      <section className="relative z-10 min-h-[40vh] flex flex-col justify-end py-16 border-b border-border">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
              Cloud news
            </p>
            <h1
              className="font-heading font-extrabold leading-[0.88] tracking-tight text-foreground mb-6"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
            >
              AWS news,<br />
              curated for <span style={{ color: 'var(--primary)' }}>you.</span>
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="text-muted-foreground text-base leading-relaxed max-w-[50ch]">
                The latest AWS announcements, updates, and cloud industry news,
                hand-picked for the UH cloud community.
              </p>
              <div className="inline-flex items-center gap-2 shrink-0 self-start sm:self-auto px-3 py-1.5 rounded-full border border-[var(--success)]/30 bg-[var(--success)]/[8%]">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]" />
                </span>
                <span className="text-xs font-medium tracking-wide" style={{ color: 'var(--success)' }}>
                  Live feed
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Embed (desktop) / Card (mobile) ── */}
      <section className="relative z-10 py-12">
        <div className="container mx-auto px-6">

          {/* Bar above iframe */}
          <ScrollReveal>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Latest updates
              </p>
              <a
                href={EXTERNAL_LINKS.cloudNews}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors duration-150"
                aria-label="Open AWS Cloud News in a new tab"
              >
                Open in new tab
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </ScrollReveal>

          {/* ── Desktop: full iframe embed ── */}
          <ScrollReveal delay={80}>
            <div
              className="hidden md:block relative rounded-lg overflow-hidden border border-border bg-muted/10"
              style={{ height: 'calc(100vh - 10rem)', minHeight: '640px' }}
            >
              {/* Loading skeleton */}
              {!loaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background">
                  <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading news feed…</p>
                </div>
              )}

              <iframe
                src={EXTERNAL_LINKS.cloudNews}
                title="AWS Cloud Club UH: Cloud News"
                className={`w-full h-full transition-opacity duration-500 ${
                  loaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setLoaded(true)}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                loading="lazy"
              />
            </div>
          </ScrollReveal>

          {/* ── Mobile: styled link-out card ── */}
          <ScrollReveal delay={80}>
            <div className="md:hidden rounded-lg border border-border bg-muted/10 p-8 flex flex-col gap-6">

              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Newspaper className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-foreground leading-snug">
                    AWS Cloud News
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Curated by AWS Cloud Club UH
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                The latest AWS announcements, service updates, and cloud industry
                news curated for the UH community and updated regularly.
              </p>

              <a
                href={EXTERNAL_LINKS.cloudNews}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded bg-primary text-primary-foreground font-semibold text-sm transition-all duration-150 hover:opacity-90 active:scale-[0.98] w-fit"
              >
                Read latest news
                <ArrowRight className="w-4 h-4" />
              </a>

            </div>
          </ScrollReveal>

        </div>
      </section>

    </PageLayout>
  );
};

export default NewsPage;
