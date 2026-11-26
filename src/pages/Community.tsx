import PageLayout from '@/components/PageLayout';
import ScrollReveal from '@/components/ScrollReveal';
import WaysToJoin from '@/components/WaysToJoin';
import TeamSection from '@/components/TeamSection';

// Formerly /about (who we are, what we do) and /team (the people). Both old
// URLs redirect here; /team lands on #team.

const pillars = [
  {
    title: 'Hands-On Learning',
    desc: 'Workshops, labs, and live cloud demos built around real AWS services. From EC2 to Lambda, we learn by building, not watching slides.',
  },
  {
    title: 'AWS Badge Progression',
    desc: 'Club events count toward official AWS Student Builder Groups recognition milestones. Track your progress and earn badges along the way.',
  },
  {
    title: 'A Global Builder Network',
    desc: 'UH is part of the worldwide AWS Student Builder Groups program. Connect with Student Builder Campus Leaders, ambassadors, and nearby groups across Texas and beyond.',
  },
];

const CommunityPage = () => (
  <PageLayout intensity="low">

    {/* ── Header ── */}
    <section className="relative z-10 min-h-[40vh] flex flex-col justify-end py-16">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
            Community
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
        </ScrollReveal>
      </div>
    </section>

    {/* ── What we do ── */}
    <section aria-labelledby="what-we-do-heading" className="relative z-10 border-t border-border py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-16 items-start">
          <h2 id="what-we-do-heading" className="font-heading font-bold text-2xl leading-snug text-foreground">
            What we do
          </h2>
          <ul className="divide-y divide-border">
            {pillars.map((p) => (
              <li key={p.title} className="py-6 first:pt-0">
                <h3 className="font-heading font-semibold text-foreground mb-2">{p.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed max-w-[55ch]">{p.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    <WaysToJoin />

    <TeamSection />

    {/* ── Program note ── */}
    <section className="relative z-10 border-t border-border py-16">
      <div className="container mx-auto px-6">
        <p className="text-base text-muted-foreground max-w-[60ch]">
          AWS Student Builder Group at UH is part of the{' '}
          <strong className="text-foreground font-medium">AWS Student Builder Groups program</strong>, a
          global network of student communities supported by Amazon Web Services.
          We are not an Amazon employee organization; we are students building
          for the cloud, together.
        </p>
      </div>
    </section>

  </PageLayout>
);

export default CommunityPage;
