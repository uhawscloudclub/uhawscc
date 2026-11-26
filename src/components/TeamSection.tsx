import PixelIcon from '@/components/PixelIcon';
import perryHeadshot from '@/images/perry-headshot.jpg';
import peddojuHeadshot from '@/images/peddoju-headshot.jpg';
import martinezHeadshot from '@/images/jose-martinez-headshot.jpg';
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

// Faculty advisors, from their UH Computer Information Systems faculty pages.
const advisors = [
  {
    name: 'Dr. Suresh Peddoju',
    title: 'Instructional Assistant Professor, Computer Information Systems',
    image: peddojuHeadshot,
    email: 'speddoju@central.uh.edu',
    phone: '713-743-3898',
  },
  {
    name: 'Dr. José C. Martínez',
    title: 'Instructional Associate Professor, Computer Information Systems',
    image: martinezHeadshot,
    email: 'jcmartinez34@uh.edu',
    phone: '713-743-6756',
  },
];

/**
 * Officers and faculty advisors, shown on /community under #team (the old
 * /team URL redirects there). A plain grid of people, not cards: square
 * headshots in notched pixel frames, name, role, and a LinkedIn link.
 */
const TeamSection = () => (
  <section id="team" aria-labelledby="team-heading" className="relative border-t border-border py-16 scroll-mt-20">
    <div className="container mx-auto px-6">
      <h2 id="team-heading" className="text-foreground">
        The people behind the club
      </h2>
      <p className="text-base text-muted-foreground leading-relaxed mt-3 max-w-[50ch]">
        Students who decided to build something instead of waiting for
        someone else to do it.
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10 mt-10">
        {team.map((member, i) => (
          <li key={member.name} className="flex items-center gap-5">
            <img
              src={member.image}
              alt={member.name}
              width={80}
              height={80}
              loading={i >= 3 ? 'lazy' : undefined}
              className="px-avatar w-20 h-20 object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="font-bold text-foreground leading-snug">{member.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{member.role}</p>
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${member.name}'s LinkedIn profile`}
                className="px-link text-sm"
              >
                LinkedIn
                <PixelIcon name="external" size={12} />
              </a>
            </div>
          </li>
        ))}
      </ul>

      <h3 className="text-foreground text-lg mt-16 mb-6">Faculty advisors</h3>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
        {advisors.map((a) => (
          <li key={a.email} className="flex items-start gap-5">
            <img
              src={a.image}
              alt={a.name}
              width={80}
              height={80}
              loading="lazy"
              decoding="async"
              className="px-avatar w-20 h-20 object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="font-bold text-foreground leading-snug">{a.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5 leading-snug">Faculty Advisor</p>
              <p className="text-sm text-muted-foreground leading-snug">{a.title}</p>
              <a href={`mailto:${a.email}`} className="px-link text-sm">
                {a.email}
              </a>
              <p className="text-sm text-muted-foreground">
                <a href={`tel:+1${a.phone.replace(/-/g, '')}`} className="underline underline-offset-4">
                  {a.phone}
                </a>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default TeamSection;
