import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { JOIN_CHANNELS } from '@/data/joinChannels';

/**
 * "Ways to join": one list, each place with what it's for. Meetup is listed
 * first and styled as the primary action; everything else is a plain link.
 */
const WaysToJoin = () => (
  <section aria-labelledby="ways-to-join-heading" className="relative z-10 border-t border-border py-20">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-16 items-start">
        <div>
          <h2 id="ways-to-join-heading" className="font-heading font-bold text-2xl leading-snug text-foreground">
            Ways to join
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mt-3 max-w-[32ch]">
            Free and open to all UH students. No experience needed.
          </p>
        </div>

        <ul className="divide-y divide-border">
          {JOIN_CHANNELS.map((channel, i) => {
            const primary = i === 0;
            const linkClass = primary
              ? 'inline-flex items-center gap-2 px-5 py-3 rounded bg-primary text-primary-foreground font-semibold text-sm transition-opacity duration-150 hover:opacity-90'
              : 'inline-flex items-center gap-1.5 text-sm text-primary py-2 hover:underline underline-offset-4';
            return (
              <li key={channel.id} className="py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="max-w-[55ch]">
                  <h3 className="font-heading font-semibold text-foreground">{channel.name}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed mt-1">{channel.purpose}</p>
                </div>
                {channel.internal ? (
                  <Link to={channel.href} className={`${linkClass} shrink-0 self-start sm:self-auto`}>
                    {channel.action}
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                ) : (
                  <a
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkClass} shrink-0 self-start sm:self-auto`}
                  >
                    {channel.action}
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  </section>
);

export default WaysToJoin;
