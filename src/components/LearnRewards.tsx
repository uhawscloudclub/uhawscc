import { useRef, useState } from 'react';
import PixelIcon from '@/components/PixelIcon';
import { BADGES, useBadges } from '@/lib/badges';
import { dataUrlToFile, drawLevelCard, type LevelCardData } from '@/lib/levelCard';

/**
 * Badges shelf + shareable level card, under the /learn HUD.
 * Locked badges show "???" and a hint. The level card is drawn on demand,
 * previewed, then downloaded or shared (Web Share with a file, where the
 * phone supports it).
 */
const LearnRewards = ({ card }: { card: Omit<LevelCardData, 'badges' | 'badgeTotal'> }) => {
  const earned = useBadges();
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const makeCard = async () => {
    setBusy(true);
    setError(false);
    try {
      canvasRef.current ??= document.createElement('canvas');
      const badges = BADGES.filter((b) => earned.includes(b.id)).map((b) => b.icon);
      setCardUrl(await drawLevelCard(canvasRef.current, { ...card, badges, badgeTotal: BADGES.length }));
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  const fileName = 'sbg-uh-level-card.png';
  const canShareFile = (() => {
    if (!cardUrl || typeof navigator === 'undefined' || !navigator.canShare) return false;
    try {
      return navigator.canShare({ files: [dataUrlToFile(cardUrl, fileName)] });
    } catch {
      return false;
    }
  })();

  const share = async () => {
    if (!cardUrl) return;
    try {
      await navigator.share({ files: [dataUrlToFile(cardUrl, fileName)], title: 'My AWS SBG at UH level card' });
    } catch {
      // Share sheet dismissed: nothing to do.
    }
  };

  return (
    <section aria-labelledby="badges-heading" className="mb-14">
      <h2 id="badges-heading" className="text-foreground mb-1" style={{ fontSize: '1.875rem' }}>
        Badges <span className="text-muted-foreground text-xl">{earned.length}/{BADGES.length}</span>
      </h2>
      <p className="text-sm text-muted-foreground mb-4">Hidden around the site. Saved in this browser.</p>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BADGES.map((b) => {
          const got = earned.includes(b.id);
          return (
            <li key={b.id} className={`px-badge ${got ? 'is-earned' : ''}`}>
              <span className="px-badge-icon" aria-hidden="true">
                <PixelIcon name={got ? b.icon : 'close'} size={18} />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-sm leading-snug">
                  {got ? b.name : <><span aria-hidden="true">???</span><span className="sr-only">Locked badge</span></>}
                </span>
                <span className="block text-xs leading-snug mt-0.5 opacity-90">{got ? b.desc : b.hint}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-6">
        {!cardUrl ? (
          <button type="button" onClick={makeCard} disabled={busy} className="px-link">
            <PixelIcon name="star" size={14} />
            {busy ? 'Drawing your card…' : 'Make my level card'}
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <img src={cardUrl} alt={`Level card: ${card.levelLabel}, ${card.done} of ${card.total} resources, ${earned.length} badges`} width={240} height={240} className="px-avatar w-60 h-60" />
            <div className="flex flex-col items-start gap-2">
              <p className="text-sm text-muted-foreground max-w-[32ch]">Post it, or send it to your study group.</p>
              {canShareFile && (
                <button type="button" onClick={share} className="px-button">Share</button>
              )}
              <a href={cardUrl} download={fileName} className={canShareFile ? 'px-link' : 'px-button'}>Download PNG</a>
              <button type="button" onClick={makeCard} className="px-link text-sm">
                <PixelIcon name="refresh" size={12} />
                Redraw with my latest progress
              </button>
            </div>
          </div>
        )}
        {error && <p role="alert" className="text-sm mt-2">Couldn't draw the card in this browser.</p>}
      </div>
    </section>
  );
};

export default LearnRewards;
