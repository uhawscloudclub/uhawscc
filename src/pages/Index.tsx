import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import SectionErrorBoundary from '@/components/SectionErrorBoundary';
import ProofStrip from '@/components/ProofStrip';
import NextEvent from '@/components/NextEvent';
import WaysToJoin from '@/components/WaysToJoin';
import Mascot from '@/components/Mascot';
import { EXTERNAL_LINKS } from '@/config/externalLinks';
import { getCommunityPhotos } from '@/data/communityPhotos';

// Plain React.lazy, deliberately NOT lazyWithReload: that helper's recovery
// path is a full window.location.reload() via the app-level ErrorBoundary,
// which is right for a route but disproportionate for an optional section.
// Here a failed chunk should drop only the photos. Splitting also keeps embla
// out of the eager homepage entry chunk.
const CommunityCarousel = lazy(() => import('@/components/CommunityCarousel'));

// Read at module scope so a zero-photo set never even requests the chunk.
const communitySlides = getCommunityPhotos();

// Three places to go next. Not a numbered list: they aren't steps.
const destinations = [
  {
    title: 'Come to an event',
    desc: 'Hands-on workshops, career nights, and study sessions on campus and online. Free, and no experience needed.',
    to: '/events',
    action: 'See events',
  },
  {
    title: 'Work toward a certification',
    desc: 'Set up your free AWS accounts, then follow the Cloud Practitioner path and track your progress as you go.',
    to: '/learn',
    action: 'Start learning',
  },
  {
    title: 'Meet the crew',
    desc: 'The students who run the club, our faculty advisor, and every place to find us between events.',
    to: '/community',
    action: 'Meet the community',
  },
];

const HomePage = () => (
  <PageLayout>

    {/* ── Hero + Next up ── */}
    <section className="relative overflow-hidden px-sky">
      <div className="container mx-auto px-6 pt-24 sm:pt-32 pb-12 relative">
        <div className="flex flex-col-reverse md:flex-row md:items-start md:justify-between gap-6 max-w-5xl">
          <div className="max-w-2xl">
            <h1
              className="text-foreground mb-5"
              style={{ fontSize: 'clamp(3rem, 10vw, 5.75rem)' }}
            >
              Build cloud skills with UH students.
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-[48ch] mb-7">
              Free AWS workshops, certification study groups, and people to build
              with, run by students at the University of Houston.
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <a
                href={EXTERNAL_LINKS.meetup}
                target="_blank"
                rel="noopener noreferrer"
                className="px-button"
              >
                Join on Meetup
              </a>
              <Link to="/events" className="px-link">
                See upcoming events
              </Link>
            </div>
          </div>
          {/* Small above the heading on phones, large beside it from md up. */}
          <Mascot size={176} className="px-float w-16 h-auto md:w-44 md:mt-2 md:mr-4 lg:mr-16 shrink-0" />
        </div>

        <div className="mt-10 md:mt-12">
          <NextEvent />
        </div>
      </div>
    </section>

    {/* ── Proof strip ── */}
    <section className="relative border-t border-border py-10">
      <div className="container mx-auto px-6">
        <ProofStrip />
      </div>
    </section>

    {/* ── Community photos ──
        Rendered only when photos exist, so an empty set costs no chunk
        request and leaves no empty placeholder on the page. */}
    {communitySlides.length > 0 && (
      // The boundary wraps the whole <section>, not just the carousel: if the
      // chunk fails, the heading, border and spacing must go with it rather
      // than leaving a labelled empty band on the page.
      <SectionErrorBoundary>
        <section className="relative border-t border-border py-14">
          <div className="container mx-auto px-6">
            <h2 className="text-foreground mb-6">Our community</h2>
            <Suspense
              fallback={
                <div className="aspect-[16/10] w-full animate-pulse motion-reduce:animate-none border border-border bg-muted" />
              }
            >
              <CommunityCarousel photos={communitySlides} />
            </Suspense>
          </div>
        </section>
      </SectionErrorBoundary>
    )}

    {/* ── Where to go next ── */}
    <section aria-labelledby="what-you-can-do-heading" className="relative border-t border-border py-16">
      <div className="container mx-auto px-6">
        <h2 id="what-you-can-do-heading" className="text-foreground mb-10">
          What you can do here
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {destinations.map((d) => (
            <li key={d.to}>
              <h3 className="text-lg text-foreground mb-2">{d.title}</h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-2">{d.desc}</p>
              <Link to={d.to} className="px-link">{d.action}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* ── Ways to join ── */}
    <WaysToJoin />

    {/* ── Network note ── */}
    <section className="relative border-t border-border py-12">
      <div className="container mx-auto px-6">
        <p className="text-sm text-muted-foreground max-w-[60ch]">
          The AWS Student Builder Group (SBG) at UH is part of the AWS Student Builder Groups program, a
          global network of student communities supported directly by Amazon
          Web Services.
        </p>
      </div>
    </section>

  </PageLayout>
);

export default HomePage;
