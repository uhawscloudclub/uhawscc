import PageLayout from '@/components/PageLayout';
import WaysToJoin from '@/components/WaysToJoin';
import TeamSection from '@/components/TeamSection';
import SkySparkles from '@/components/SkySparkles';
import PixelIcon, { type PixelIconName } from '@/components/PixelIcon';
import { Link } from 'react-router-dom';
import { flyerFor } from '@/data/eventFlyers';

// Formerly /about (who we are, what we do) and /team (the people). Both old
// URLs redirect here; /team lands on #team.

const meetupEvent = (id: string) => `https://www.meetup.com/aws-sbg-at-univ-of-houston/events/${id}/`;

// What the club runs, each with real recent examples from PAST_EVENTS and
// the flyer of one of them on the card.
const pillars: Array<{ title: string; desc: string; recently: string; icon: PixelIconName; flyerEvent: string }> = [
  {
    title: 'Hands-on workshops',
    icon: 'clipboard',
    flyerEvent: meetupEvent('316688453'),
    desc: 'Workshops, labs, projects, and team-based competitions built around real AWS services, so members learn together and build together.',
    recently: 'Intro to DevOps & CI/CD on AWS, Git and GitHub Foundations, AI penetration testing with Amazon Bedrock.',
  },
  {
    title: 'Industry networking',
    icon: 'chat',
    flyerEvent: meetupEvent('316739897'),
    desc: 'Networking events and information sessions where students meet people working in cloud and ask them questions directly.',
    recently: 'Day in the Life of a Cloud Support Engineer, the Zero to Certified panel, AWS Community on Tour at the Amazon Houston office.',
  },
  {
    title: 'Certification prep',
    icon: 'check',
    flyerEvent: meetupEvent('317518911'),
    desc: 'Study cohorts like the AWS Cloud Cup, where members prepare for an AWS certification alongside study partners and work toward an exam voucher.',
    recently: 'AWS Cloud Cup practice exam day, the Certification Prep Capstone & Voucher Kickoff.',
  },
  {
    title: 'Professional development',
    icon: 'briefcase',
    flyerEvent: meetupEvent('316460129'),
    desc: 'Practice for the skills around the tech: technical presentations, soft skills, and interview prep with the STAR method.',
    recently: 'Career Fair Prep: resume triage, mock interviews, and 30-second introductions.',
  },
];

const CommunityPage = () => (
  <PageLayout>

    {/* ── Header ── */}
    <section className="relative overflow-hidden px-sky px-sky-high">
      <SkySparkles />
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
        <h2 id="what-we-do-heading" className="text-foreground">
          What we do
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed mt-3 max-w-[48ch]">
          Four kinds of events, all free, all run by students.
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {pillars.map((p) => {
            const flyer = flyerFor(p.flyerEvent);
            return (
              <li key={p.title} className="px-panel px-event-card">
                {flyer && (
                  // A recent event of this kind; the "Recently" line names it.
                  <img src={flyer} alt="" width={800} height={450} loading="lazy" decoding="async" />
                )}
                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-center gap-3">
                    <span className="px-join-icon" aria-hidden="true">
                      <PixelIcon name={p.icon} size={18} />
                    </span>
                    <h3 className="font-bold text-foreground text-lg leading-snug">{p.title}</h3>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed mt-3">{p.desc}</p>
                  <div className="mt-auto pt-4">
                    <p className="px-recently text-sm">
                      <span className="font-semibold text-foreground">Recently:</span> {p.recently}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <Link to="/events" className="px-link mt-6">
          See all past events
          <PixelIcon name="arrowRight" size={14} />
        </Link>
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
