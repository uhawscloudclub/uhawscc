import PageLayout from '@/components/PageLayout';
import ScrollReveal from '@/components/ScrollReveal';
import { ArrowRight } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/config/externalLinks';

const pillars = [
  {
    title: 'Hands-On Learning',
    desc: 'Workshops, labs, and live cloud demos built around real AWS services. From EC2 to Lambda, we learn by building, not watching slides.',
  },
  {
    title: 'AWS Badge Progression',
    desc: 'Club events count toward official AWS Cloud Clubs recognition milestones. Track your progress and earn badges along the way.',
  },
  {
    title: 'Community & Careers',
    desc: 'Connect with peers, alumni, and Houston-area cloud professionals. Build your network while you build in the cloud.',
  },
];

const AboutPage = () => (
  <PageLayout intensity="low">

    {/* ── What We Do ── */}
    <section className="relative z-10 min-h-screen flex flex-col justify-center py-24">
      <div className="container mx-auto px-6">

        {/* Header */}
        <ScrollReveal>
          <div className="max-w-3xl mb-16">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
              About us
            </p>
            <h1
              className="font-heading font-extrabold leading-[0.88] tracking-tight text-foreground mb-6"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
            >
              Built by students,<br />
              for <span style={{ color: 'var(--primary)' }}>students.</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-[55ch]">
              We bring cloud computing education, community, and career opportunities
              to University of Houston students, for free.
            </p>
          </div>
        </ScrollReveal>

        {/* Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-16 items-start">
          <ScrollReveal>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
                What we do
              </p>
              <h2 className="font-heading font-bold text-2xl leading-snug text-foreground">
                Three things<br />we focus on
              </h2>
              <a
                href={EXTERNAL_LINKS.meetup}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary mt-5 hover:gap-2.5 transition-all duration-150"
              >
                Join the community
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </ScrollReveal>

          <div className="divide-y divide-border">
            {pillars.map((p, i) => (
              <ScrollReveal key={p.title} delay={i * 70}>
                <div className="py-7 grid grid-cols-[2rem_1fr] gap-5 items-start">
                  <span className="text-xs font-mono text-primary/70 pt-0.5">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-2">
                      {p.title}
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed max-w-[55ch]">
                      {p.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

      </div>
    </section>

    {/* ── Program note ── */}
    <section className="relative z-10 border-t border-border py-16">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <p className="text-base text-muted-foreground max-w-[60ch]">
            AWS Cloud Club at UH is part of the{' '}
            <strong className="text-foreground font-medium">AWS Cloud Clubs program</strong>, a
            global network of student communities supported by Amazon Web Services.
            We are not an Amazon employee organization; we are students building
            for the cloud, together.
          </p>
        </ScrollReveal>
      </div>
    </section>

  </PageLayout>
);

export default AboutPage;
