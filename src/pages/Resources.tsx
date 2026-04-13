import PageLayout from '@/components/PageLayout';
import ScrollReveal from '@/components/ScrollReveal';
import { ArrowRight } from 'lucide-react';

const resources = [
  {
    title: 'Create Your First AWS Account',
    tag: 'Start here',
    desc: 'Get started with AWS by creating a free account and accessing the AWS Free Tier. Takes about 10 minutes.',
    cta: 'Create AWS Account',
    href: 'https://aws.amazon.com/resources/create-account/',
  },
  {
    title: 'AWS Skill Builder',
    tag: 'Free training',
    desc: 'Access free cloud training courses on AWS Skill Builder, including foundational, associate, and specialty paths.',
    cta: 'Explore Skill Builder',
    href: 'https://skillbuilder.aws',
  },
  {
    title: 'AWS Free Tier',
    tag: 'Hands-on practice',
    desc: 'Practice building on real AWS infrastructure with the AWS Free Tier at no cost for eligible services within limits.',
    cta: 'Get started free',
    href: 'https://aws.amazon.com/free',
  },
  {
    title: 'Free Exam Vouchers via AWS Academy',
    tag: 'UH students only',
    desc: 'UH students can receive up to 4 fully discounted certification exam vouchers and a free 1-year Skill Builder subscription through AWS Academy. Fill out the form and we\'ll get you access via the CIS department.',
    cta: 'Request Access',
    href: 'https://docs.google.com/forms/d/1S6LrqVlFaMWfUPcBpOxkijHLidYz4kdxmElk2VGyqPI/viewform',
  },
  {
    title: 'Skill Builder Setup Guide',
    tag: 'AWS Academy holders',
    desc: 'Already have AWS Academy access? Step-by-step guide to activate your free Skill Builder subscription through Canvas and claim certification vouchers via Pearson Vue.',
    cta: 'View Guide',
    href: '/docs/skill-builder-guide.pdf',
  },
  {
    title: 'Club LinkTree',
    tag: 'Community links',
    desc: 'Our curated hub of social media, community channels, and other ways to stay connected with the club.',
    cta: 'Open LinkTree',
    href: 'https://linktr.ee/uhawscc',
  },
];

const ResourcesPage = () => (
  <PageLayout intensity="low">

    {/* ── Header ── */}
    <section className="relative z-10 min-h-[40vh] flex flex-col justify-end py-16 border-b border-border">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
            Resources
          </p>
          <h1
            className="font-heading font-extrabold leading-[0.88] tracking-tight text-foreground mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
          >
            Everything you<br />
            need to <span style={{ color: 'var(--primary)' }}>start.</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-[50ch]">
            Tools, training, and community access to accelerate your cloud journey.
            All free.
          </p>
        </ScrollReveal>
      </div>
    </section>

    {/* ── Resource list ── */}
    <section className="relative z-10 py-16">
      <div className="container mx-auto px-6">
        <div className="divide-y divide-border">
          {resources.map((r, i) => (
            <ScrollReveal key={r.title} delay={i * 70}>
              <div className="py-8 grid grid-cols-[2rem_1fr] gap-5 items-start">
                <span className="text-xs font-mono text-primary/70 pt-1">
                  0{i + 1}
                </span>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="font-heading font-semibold text-foreground">
                        {r.title}
                      </h3>
                      <span className="text-[10px] uppercase tracking-[0.12em] text-primary/70 border border-primary/25 rounded px-1.5 py-0.5 bg-primary/[8%]">
                        {r.tag}
                      </span>
                    </div>
                    <p className="text-base text-muted-foreground leading-relaxed max-w-[55ch]">
                      {r.desc}
                    </p>
                  </div>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:gap-2.5 transition-all duration-150 whitespace-nowrap shrink-0"
                  >
                    {r.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

  </PageLayout>
);

export default ResourcesPage;
