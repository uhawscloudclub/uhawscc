import { Link } from 'react-router-dom';
import PixelIcon from '@/components/PixelIcon';
import { JOIN_CHANNELS } from '@/data/joinChannels';

/**
 * "Ways to join": a grid of pixel cards, one per place, each saying what it's
 * for. Meetup comes first, marked "Start here", with the primary button;
 * the rest use plain links. Each card's link sits at the bottom so the
 * actions line up across a row.
 */
const WaysToJoin = () => (
  <section aria-labelledby="ways-to-join-heading" className="relative z-10 border-t border-border py-20">
    <div className="container mx-auto px-6">
      <h2 id="ways-to-join-heading" className="text-foreground">
        Ways to join
      </h2>
      <p className="text-base text-muted-foreground leading-relaxed mt-3 max-w-[48ch]">
        Free and open to all UH students. No experience needed.
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
        {JOIN_CHANNELS.map((channel, i) => {
          const primary = i === 0;
          return (
            <li key={channel.id} className={`px-panel px-join-card ${primary ? 'is-primary' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="px-join-icon" aria-hidden="true">
                  <PixelIcon name={channel.icon} size={18} />
                </span>
                <h3 className="font-bold text-foreground text-lg leading-snug">{channel.name}</h3>
                {primary && <span className="px-chip px-countdown ml-auto">Start here</span>}
              </div>
              <p className="text-base text-muted-foreground leading-relaxed mt-3">{channel.purpose}</p>
              <div className="mt-auto pt-5">
                {channel.internal ? (
                  <Link to={channel.href} className={primary ? 'px-button' : 'px-link'}>
                    {channel.action}
                  </Link>
                ) : (
                  <a
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={primary ? 'px-button' : 'px-link'}
                  >
                    {channel.action}
                    <PixelIcon name="external" size={12} />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  </section>
);

export default WaysToJoin;
