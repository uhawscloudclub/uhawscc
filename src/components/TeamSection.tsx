import { useRef, useState } from 'react';
import { unlockBadge } from '@/lib/badges';
import PixelIcon from '@/components/PixelIcon';
import perryHeadshot from '@/images/perry-headshot.jpg';
import peddojuHeadshot from '@/images/peddoju-headshot.jpg';
import martinezHeadshot from '@/images/jose-martinez-headshot.jpg';
import hiabHeadshot from '@/images/hiab-headshot.jpg';
import quincyHeadshot from '@/images/quincy-britton-headshot.jpeg';
import ananyaHeadshot from '@/images/ananya.jpg';
import charlesHeadshot from '@/images/charles-headshot.jpg';
import abdulHeadshot from '@/images/abdul-ayinde-alao-headshot.jpg';

interface Officer {
  name: string;
  role: string;
  image: string;
  linkedinUrl: string;
  /** What they do for the club, one sentence. */
  does: string;
  /** Off the clock, from their own officer bio. */
  offTheClock: string;
  /** Favorite AWS service, only when they told us. */
  favoriteService?: string;
}

// Bios condensed from each officer's own intro post.
const team: Officer[] = [
  {
    name: 'Perry Takyi', role: 'President & Founder', image: perryHeadshot, linkedinUrl: 'https://www.linkedin.com/in/perry-takyi/',
    does: 'Leads the club, building a community around cloud, AI, cybersecurity, and other emerging tech.',
    offTheClock: 'In the gym, playing sports, drinking matcha, trying new foods, traveling, taking pictures, and listening to music.',
    favoriteService: 'CodePipeline and CodeDeploy',
  },
  {
    name: 'Hiab Negash', role: 'Director of Marketing & Outreach', image: hiabHeadshot, linkedinUrl: 'https://www.linkedin.com/in/hiab-negash/',
    does: 'Runs marketing and outreach for the club.',
    offTheClock: 'Loves comedy movies and will do any physical activity there is. Just a chill guy.',
  },
  {
    name: 'Quincy Britton', role: 'Director of Events', image: quincyHeadshot, linkedinUrl: 'https://www.linkedin.com/in/quincy-britton-a35508317/',
    does: 'Handles events and logistics, making sure every event comes together the way it was planned.',
    offTheClock: 'Soccer, basketball, the gym, trying something new in the kitchen, and every MCU drop.',
  },
  {
    name: 'Ananya Shekhawat', role: 'Director of Operations', image: ananyaHeadshot, linkedinUrl: 'https://www.linkedin.com/in/-ananya-shekhawat/',
    does: 'Keeps everything organized behind the scenes so events and operations run smoothly.',
    offTheClock: 'Reading, watching movies, planning the next road trip, finding new cafes, music, and time outdoors.',
  },
  {
    name: 'Charles Ezeribe', role: 'Director of Technical Education', image: charlesHeadshot, linkedinUrl: 'https://www.linkedin.com/in/charles-ezeribe/',
    does: 'Builds the workshops and certification content that help members get AWS certified.',
    offTheClock: 'At the gym, on a hike, or learning Japanese to finally watch anime without subtitles.',
  },
  {
    name: 'Abdul Ayinde Alao', role: 'Director of Content & Media', image: abdulHeadshot, linkedinUrl: 'https://www.linkedin.com/in/abdul-azeez-ayinde/',
    does: 'Creates the club’s content, documents events, and supports marketing.',
    offTheClock: 'Arts and crafts, watching anime, and indulging in sports a bunch.',
  },
];

// Faculty advisors, from their UH Computer Information Systems faculty pages.
const advisors = [
  {
    name: 'Dr. José C. Martínez',
    title: 'Instructional Associate Professor, Computer Information Systems',
    image: martinezHeadshot,
    email: 'jcmartinez34@uh.edu',
    phone: '713-743-6756',
  },
  {
    name: 'Dr. Suresh Peddoju',
    title: 'Instructional Assistant Professor, Computer Information Systems',
    image: peddojuHeadshot,
    email: 'speddoju@central.uh.edu',
    phone: '713-743-3898',
  },
];

/**
 * An officer card that flips between the profile (front) and "player stats"
 * (back). Only the visible face is rendered, so screen readers and keyboard
 * focus never reach hidden content; the flip itself is a short CSS squash
 * that is skipped for reduced motion.
 */
const OfficerCard = ({ member, lazy, onFlip }: { member: Officer; lazy: boolean; onFlip: (name: string) => void }) => {
  const [flips, setFlips] = useState(0);
  const flipped = flips % 2 === 1;
  const statsId = `stats-${member.name.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return (
    <li className="px-panel px-officer">
      <div key={flips} className={`${flips ? 'px-flip-in ' : ''}flex flex-col h-full p-5`}>
        {!flipped ? (
          <div className="flex items-center gap-5">
            <img
              src={member.image}
              alt={member.name}
              width={80}
              height={80}
              loading={lazy ? 'lazy' : undefined}
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
          </div>
        ) : (
          <dl id={statsId} className="text-sm leading-relaxed space-y-2">
            <div>
              <dt className="px-stat-label">Player</dt>
              <dd className="font-bold text-foreground">{member.name}</dd>
            </div>
            <div>
              <dt className="px-stat-label">Main quest</dt>
              <dd className="text-muted-foreground">{member.does}</dd>
            </div>
            <div>
              <dt className="px-stat-label">Off the clock</dt>
              <dd className="text-muted-foreground">{member.offTheClock}</dd>
            </div>
            {member.favoriteService && (
              <div>
                <dt className="px-stat-label">Favorite AWS service</dt>
                <dd className="text-foreground">{member.favoriteService}</dd>
              </div>
            )}
          </dl>
        )}
        <button
          type="button"
          onClick={() => {
            setFlips((n) => n + 1);
            onFlip(member.name);
          }}
          aria-expanded={flipped}
          aria-controls={flipped ? statsId : undefined}
          className="px-link text-sm mt-auto pt-3 self-start"
        >
          <PixelIcon name={flipped ? 'arrowLeft' : 'arrowRight'} size={14} />
          {flipped ? 'Back to profile' : `${member.name.split(' ')[0]}'s player stats`}
        </button>
      </div>
    </li>
  );
};

/**
 * Officers and faculty advisors, shown on /community under #team (the old
 * /team URL redirects there). Officers are flip cards (profile / player
 * stats); advisors stay a plain list with contact details.
 */
const TeamSection = () => {
  // Card Collector: unlocked once every officer card has been flipped.
  const flippedRef = useRef(new Set<string>());
  const onFlip = (name: string) => {
    flippedRef.current.add(name);
    if (flippedRef.current.size === team.length) unlockBadge('card-collector');
  };
  return (
  <section id="team" aria-labelledby="team-heading" className="relative border-t border-border py-16 scroll-mt-20">
    <div className="container mx-auto px-6">
      <h2 id="team-heading" className="text-foreground">
        The people behind the club
      </h2>
      <p className="text-base text-muted-foreground leading-relaxed mt-3 max-w-[50ch]">
        Students who decided to build something instead of waiting for
        someone else to do it.
      </p>

      <p className="text-sm text-muted-foreground mt-2">Tap a card to see their player stats.</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {team.map((member, i) => (
          <OfficerCard key={member.name} member={member} lazy={i >= 3} onFlip={onFlip} />
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
};

export default TeamSection;
