import PageLayout from '@/components/PageLayout';
import ScrollReveal from '@/components/ScrollReveal';
import { Calendar, ArrowRight, RefreshCw, ExternalLink } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/config/externalLinks';
import { useEvents } from '@/hooks/useEvents';

// ── Loading skeleton ──────────────────────────────────────────────────────────
const EventSkeleton = ({ index }: { index: number }) => (
  <div className="py-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start animate-pulse">
    <div className="grid grid-cols-[2rem_1fr] gap-5 items-start">
      <div className="h-3 w-5 bg-muted rounded mt-1" />
      <div className="space-y-3">
        <div className="h-5 w-20 bg-muted rounded-full" />
        <div className={`h-5 bg-muted rounded ${index === 0 ? 'w-4/5' : 'w-3/5'}`} />
        <div className="h-4 w-2/5 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
      </div>
    </div>
    <div className="lg:pt-1 pl-9 lg:pl-0">
      <div className="h-9 w-32 bg-muted rounded" />
    </div>
  </div>
);

// ── Error / fallback state ────────────────────────────────────────────────────
const EventsError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="py-12 flex flex-col items-start gap-6">
    <div>
      <p className="font-heading font-semibold text-foreground mb-1">
        Couldn't load events right now
      </p>
      <p className="text-sm text-muted-foreground max-w-[45ch]">
        The live feed is temporarily unavailable. You can view all events directly
        on Meetup, or try again below.
      </p>
    </div>
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 rounded border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors duration-150"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Try again
      </button>
      <a
        href={EXTERNAL_LINKS.meetup}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-primary hover:gap-2.5 transition-all duration-150"
      >
        View on Meetup
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  </div>
);

// ── No upcoming events state ──────────────────────────────────────────────────
const NoUpcomingEvents = () => (
  <div className="py-12 flex flex-col items-start gap-4">
    <p className="font-heading font-semibold text-foreground">
      No upcoming events yet
    </p>
    <p className="text-sm text-muted-foreground max-w-[45ch]">
      We're planning the next one. Follow the group on Meetup to get notified
      the moment it drops.
    </p>
    <a
      href={EXTERNAL_LINKS.meetup}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary text-primary-foreground font-semibold text-sm transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
    >
      Follow on Meetup
      <ArrowRight className="w-4 h-4" />
    </a>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const EventsPage = () => {
  const { data: events, isLoading, isError, refetch, dataUpdatedAt } = useEvents();

  const upcoming = events?.filter((e) => e.status === 'upcoming') ?? [];
  const hasUpcoming = upcoming.length > 0;

  return (
    <PageLayout intensity="low">

      {/* ── Header ── */}
      <section className="relative z-10 min-h-[40vh] flex flex-col justify-end py-16 border-b border-border">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
              Events
            </p>
            <h1
              className="font-heading font-extrabold leading-[0.88] tracking-tight text-foreground mb-6"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
            >
              Upcoming<br />
              <span style={{ color: 'var(--primary)' }}>meetups.</span>
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="text-muted-foreground text-base leading-relaxed max-w-[50ch]">
                All events are published on Meetup. RSVP to save your spot —
                seats go fast.
              </p>
              {/* Live indicator */}
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

      {/* ── Event list ── */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-6">

          {/* Loading */}
          {isLoading && (
            <div className="divide-y divide-border">
              {[0, 1].map((i) => <EventSkeleton key={i} index={i} />)}
            </div>
          )}

          {/* Error */}
          {isError && <EventsError onRetry={() => refetch()} />}

          {/* Loaded — no upcoming */}
          {!isLoading && !isError && !hasUpcoming && <NoUpcomingEvents />}

          {/* Loaded — has upcoming events */}
          {!isLoading && !isError && hasUpcoming && (
            <div className="divide-y divide-border">
              {upcoming.map((ev, i) => (
                <ScrollReveal key={ev.id} delay={i * 80}>
                  <div className="py-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">

                    {/* Left */}
                    <div className="grid grid-cols-[2rem_1fr] gap-5 items-start">
                      <span className="text-xs font-mono text-primary/70 pt-1">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[10px] uppercase tracking-[0.12em] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                            Upcoming
                          </span>
                        </div>
                        <h2 className="font-heading font-semibold text-foreground text-lg leading-snug mb-4 max-w-[55ch]">
                          {ev.title}
                        </h2>
                        <div className="flex flex-col gap-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            {ev.date}
                          </div>
                        </div>
                        <p className="text-base text-muted-foreground leading-relaxed max-w-[55ch]">
                          {ev.description}
                        </p>
                      </div>
                    </div>

                    {/* Right — CTA */}
                    <div className="lg:pt-1 pl-9 lg:pl-0">
                      <a
                        href={ev.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary text-primary-foreground font-semibold text-sm transition-all duration-150 hover:opacity-90 active:scale-[0.98] whitespace-nowrap"
                      >
                        RSVP on Meetup
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>

                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}

          {/* Last updated timestamp */}
          {dataUpdatedAt > 0 && !isLoading && (
            <p className="mt-8 text-xs text-muted-foreground/50">
              Last updated {new Date(dataUpdatedAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
              {' · '}
              <button
                onClick={() => refetch()}
                className="hover:text-muted-foreground transition-colors duration-150 underline underline-offset-2"
              >
                Refresh
              </button>
            </p>
          )}

        </div>
      </section>

      {/* ── Meetup note ── */}
      <section className="relative z-10 border-t border-border py-16">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <div className="flex items-center justify-between gap-8 flex-wrap">
              <p className="text-base text-muted-foreground max-w-[50ch]">
                New events are announced on Meetup first. Follow the group to
                get notified when the next event drops.
              </p>
              <a
                href={EXTERNAL_LINKS.meetup}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 whitespace-nowrap"
              >
                See all events on Meetup
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </PageLayout>
  );
};

export default EventsPage;
