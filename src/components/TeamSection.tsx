import ScrollReveal from '@/components/ScrollReveal';
import { Linkedin } from 'lucide-react';
import perryHeadshot from '@/images/perry-headshot.jpg';
import peddojuHeadshot from '@/images/peddoju-headshot.png';
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

/**
 * Officers and faculty advisor, shown on /community under #team (the old
 * /team URL redirects there).
 */
const TeamSection = () => (
  <div id="team" className="scroll-mt-20">
    <section aria-labelledby="team-heading" className="relative z-10 border-t border-border pt-16">
      <div className="container mx-auto px-6">
        <h2 id="team-heading" className="font-heading font-bold text-2xl leading-snug text-foreground">
          The people behind the club
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed mt-3 max-w-[50ch]">
          Students who decided to build something instead of waiting for
          someone else to do it.
        </p>
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

    {/* ── Faculty Advisors ── */}
    <section className="relative z-10 border-t border-border py-16">
      <div className="container mx-auto px-6">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
            Faculty advisors
          </p>
          <h2 className="font-heading font-bold text-2xl leading-snug text-foreground mb-10">
            Academic<br />support
          </h2>
        </ScrollReveal>

        <ScrollReveal>
          <div className="border border-border bg-background p-6 flex flex-col items-start gap-3 w-64">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-muted shrink-0">
              <img
                src={peddojuHeadshot}
                alt="Dr. Suresh Peddoju"
                width={56}
                height={56}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-heading font-semibold text-foreground text-base leading-snug">
                Dr. Suresh Peddoju
              </p>
              <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                Faculty Advisor
              </p>
            </div>
            <div className="space-y-1">
              <a
                href="mailto:speddoju@central.uh.edu"
                className="text-sm text-primary hover:text-primary/80 transition-colors duration-150 block"
              >
                speddoju@central.uh.edu
              </a>
              <p className="text-sm text-muted-foreground">+1 (713) 743-3898</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>

  </div>
);

export default TeamSection;
