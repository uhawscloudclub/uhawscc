import PageLayout from '@/components/PageLayout';
import ScrollReveal from '@/components/ScrollReveal';
import { ArrowRight, Linkedin } from 'lucide-react';
import { EXTERNAL_LINKS } from '@/config/externalLinks';
import perryHeadshot from '@/images/perry-headshot.jpg';
import hiabHeadshot from '@/images/hiab-headshot.jpg';
import quincyHeadshot from '@/images/quincy-britton-headshot.jpeg';
import ananyaHeadshot from '@/images/ananya.jpg';
import charlesHeadshot from '@/images/charles-headshot.jpg';
import abdulHeadshot from '@/images/abdul-ayinde-alao-headshot.jpg';

const team = [
  { name: 'Perry Takyi', role: 'Captain & Founding Member', image: perryHeadshot, linkedinUrl: 'https://www.linkedin.com/in/perry-takyi/' },
  { name: 'Hiab Negash', role: 'Director of Marketing & Outreach', image: hiabHeadshot, linkedinUrl: 'https://www.linkedin.com/in/hiab-negash/' },
  { name: 'Quincy Britton', role: 'Director of Events', image: quincyHeadshot, linkedinUrl: 'https://www.linkedin.com/in/quincy-britton-a35508317/' },
  { name: 'Ananya Shekhawat', role: 'Director of Operations', image: ananyaHeadshot, linkedinUrl: 'https://www.linkedin.com/in/-ananya-shekhawat/' },
  { name: 'Charles Ezeribe', role: 'Director of Technical Education', image: charlesHeadshot, linkedinUrl: 'https://www.linkedin.com/in/charles-ezeribe/' },
  { name: 'Abdul Ayinde Alao', role: 'Director of Content & Media', image: abdulHeadshot, linkedinUrl: 'https://www.linkedin.com/in/abdul-azeez-ayinde/' },
];

const steps = [
  'Fill out our membership interest form',
  'RSVP to an upcoming event on Meetup',
  'Show up and start building',
];

const TeamPage = () => (
  <PageLayout intensity="low">

    {/* ── Header ── */}
    <section className="relative z-10 min-h-[40vh] flex flex-col justify-end py-16 border-b border-border">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
            The team
          </p>
          <h1
            className="font-heading font-extrabold leading-[0.88] tracking-tight text-foreground mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
          >
            The people<br />
            behind the <span style={{ color: 'var(--primary)' }}>club.</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-[50ch]">
            Students who decided to build something instead of waiting for
            someone else to do it.
          </p>
        </ScrollReveal>
      </div>
    </section>

    {/* ── Leadership grid ── */}
    <section className="relative z-10 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {team.map((member, i) => (
            <ScrollReveal key={member.name} delay={i * 50}>
              <div className="bg-background p-6 flex flex-col items-start gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-muted shrink-0">
                  <img
                    src={member.image}
                    alt={member.name}
                    width={56}
                    height={56}
                    loading={i >= 3 ? 'lazy' : undefined}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-heading font-semibold text-foreground text-base leading-snug">
                    {member.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                    {member.role}
                  </p>
                </div>
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center p-3 -m-3 rounded-lg"
                  aria-label={`Visit ${member.name}'s LinkedIn profile`}
                >
                  <Linkedin className="linkedin-icon w-4 h-4" />
                </a>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    {/* ── Join section ── */}
    <section className="relative z-10 border-t border-border py-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-16 items-start">

          {/* Left */}
          <ScrollReveal>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
                Get involved
              </p>
              <h2 className="font-heading font-bold text-2xl leading-snug text-foreground">
                Become a<br />member
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed mt-4 max-w-[30ch]">
                Open to all UH students. No experience required — just curiosity.
              </p>
            </div>
          </ScrollReveal>

          {/* Right */}
          <div>
            <div className="divide-y divide-border mb-10">
              {steps.map((step, i) => (
                <ScrollReveal key={i} delay={i * 70}>
                  <div className="py-6 grid grid-cols-[2rem_1fr] gap-5 items-start">
                    <span className="text-xs font-mono text-primary/70 pt-0.5">
                      0{i + 1}
                    </span>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {step}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={250}>
              <a
                href={EXTERNAL_LINKS.meetup}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded bg-primary text-primary-foreground font-semibold text-sm transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
              >
                Join our community
                <ArrowRight className="w-4 h-4" />
              </a>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>

  </PageLayout>
);

export default TeamPage;
