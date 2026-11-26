import PageLayout from '@/components/PageLayout';
import WaysToJoin from '@/components/WaysToJoin';
import TeamSection from '@/components/TeamSection';

// Formerly /about (who we are, what we do) and /team (the people). Both old
// URLs redirect here; /team lands on #team.

// What the club runs, each with real recent examples from PAST_EVENTS.
const pillars = [
  {
    title: 'Hands-on workshops',
    desc: 'Workshops, labs, projects, and team-based competitions built around real AWS services, so members learn together and build together.',
    recently: 'Intro to DevOps & CI/CD on AWS, Git and GitHub Foundations, AI penetration testing with Amazon Bedrock.',
  },
  {
    title: 'Industry networking',
    desc: 'Networking events and information sessions where students meet people working in cloud and ask them questions directly.',
    recently: 'Day in the Life of a Cloud Support Engineer, the Zero to Certified panel, AWS Community on Tour at the Amazon Houston office.',
  },
  {
    title: 'Certification prep',
    desc: 'Study cohorts like the AWS Cloud Cup, where members prepare for an AWS certification alongside study partners and work toward an exam voucher.',
    recently: 'AWS Cloud Cup practice exam day, the Certification Prep Capstone & Voucher Kickoff.',
  },
  {
    title: 'Professional development',
    desc: 'Practice for the skills around the tech: technical presentations, soft skills, and interview prep with the STAR method.',
    recently: 'Career Fair Prep: resume triage, mock interviews, and 30-second introductions.',
  },
];

const CommunityPage = () => (
  <PageLayout>

    {/* ── Header ── */}
    <section className="relative overflow-hidden px-sky px-sky-high">
      <div className="container mx-auto px-6 pt-28 sm:pt-36 pb-12 relative">
        <h1 className="mb-5" style={{ fontSize: 'clamp(3rem, 9vw, 5rem)' }}>
          Built by students, for students.
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-[52ch]">
          We bring cloud computing education, community, and career opportunities
          to University of Houston students, for free.
        </p>
      </div>
    </section>

    {/* ── What we do ── */}
    <section aria-labelledby="what-we-do-heading" className="relative py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-16 items-start">
          <h2 id="what-we-do-heading" className="text-foreground">
            What we do
          </h2>
          <ul className="divide-y divide-border">
            {pillars.map((p) => (
              <li key={p.title} className="py-6 first:pt-0">
                <h3 className="text-lg text-foreground mb-2">{p.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed max-w-[60ch]">{p.desc}</p>
                <p className="text-sm text-muted-foreground mt-2 max-w-[60ch]">
                  <span className="font-semibold text-foreground">Recently:</span> {p.recently}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    <WaysToJoin />

    <TeamSection />

    {/* ── Program note ── */}
    <section className="relative border-t border-border py-12">
      <div className="container mx-auto px-6">
        <p className="text-sm text-muted-foreground max-w-[60ch]">
          The AWS Student Builder Group (SBG) at UH is part of the{' '}
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
