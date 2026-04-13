import PageLayout from '@/components/PageLayout';
import ScrollReveal from '@/components/ScrollReveal';
import { ArrowRight } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/config/externalLinks';

const features = [
  {
    title: 'Hands-On Workshops',
    desc: 'Build real things on AWS, not just slides and theory. Every session has something to deploy.',
  },
  {
    title: 'AWS Badge Progression',
    desc: 'Every event moves you toward official AWS Cloud Clubs recognition milestones.',
  },
  {
    title: 'Community Connections',
    desc: 'Find people working through the same problems. Houston-area professionals, alumni, and peers.',
  },
];

const HomePage = () => (
  <PageLayout>

    {/* ── Hero ── */}
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="container mx-auto px-6 pt-28 pb-20 relative z-10">
        <div className="max-w-3xl">

          {/* Eyebrow */}
          <p className="hero-item hero-item-1 text-xs uppercase tracking-[0.18em] text-muted-foreground mb-10">
            AWS Cloud Club &middot; University of Houston
          </p>

          {/* Headline */}
          <h1
            className="hero-item hero-item-2 font-heading font-extrabold leading-[0.88] tracking-tight mb-8 text-foreground"
            style={{ fontSize: 'clamp(3rem, 8.5vw, 6.5rem)' }}
          >
            Build cloud skills.<br />
            Find your <span style={{ color: 'var(--primary)' }}>people.</span>
          </h1>

          {/* Body */}
          <p className="hero-item hero-item-3 text-muted-foreground text-lg leading-relaxed max-w-[55ch] mb-12">
            UH students building real AWS skills, earning certifications, and
            supporting each other through the journey, for free.
          </p>

          {/* CTAs */}
          <div className="hero-item hero-item-4 flex items-center gap-8">
            <a
              href={EXTERNAL_LINKS.meetup}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded bg-primary text-primary-foreground font-semibold text-sm transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
            >
              Join our community
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/events"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              Upcoming events
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </div>
    </section>

    {/* ── What We Do ── */}
    <section className="relative z-10 border-t border-border py-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-16 items-start">

          {/* Left — section label + heading */}
          <ScrollReveal>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
                What we do
              </p>
              <h2 className="font-heading font-bold text-2xl leading-snug text-foreground">
                What happens<br />at our meetups
              </h2>
              <a
                href="/events"
                className="inline-flex items-center gap-1.5 text-sm text-primary mt-5 hover:gap-2.5 transition-all duration-150"
              >
                See upcoming events
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </ScrollReveal>

          {/* Right — numbered list, no cards */}
          <div className="divide-y divide-border">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 70}>
                <div className="py-7 grid grid-cols-[2rem_1fr] gap-5 items-start">
                  <span className="text-xs font-mono text-primary/70 pt-0.5">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-2">
                      {f.title}
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed max-w-[55ch]">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </div>
    </section>

    {/* ── Network note ── */}
    <section className="relative z-10 border-t border-border py-16">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <p className="text-base text-muted-foreground max-w-[60ch]">
            AWS Cloud Club at UH is part of the AWS Cloud Clubs program, a
            global network of student communities supported directly by Amazon
            Web Services.
          </p>
        </ScrollReveal>
      </div>
    </section>

  </PageLayout>
);

export default HomePage;
