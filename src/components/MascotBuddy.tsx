import { useEffect, useRef, useState } from 'react';
import Mascot from '@/components/Mascot';
import { unlockBadge } from '@/lib/badges';
import { playSfx } from '@/lib/sound';

/**
 * The homepage mascot as a tappable buddy: each tap makes it hop and say the
 * next tip in a pixel speech bubble. Tips are real, short next steps.
 * The hop is skipped for reduced motion (CSS); the bubble still works.
 */
export const MASCOT_TIPS = [
  'New here? Step 1 is a free Builder Center account. It is on the Learn page.',
  'Every event is free. RSVP on Meetup so we save you a seat.',
  'Studying for a cert? The AWS Cloud Cup pairs you with study partners.',
  'Questions? Use the contact form. Officers reply within 24 hours.',
  'No cloud experience needed. Most members started from zero.',
] as const;

const MascotBuddy = ({ className = '' }: { className?: string }) => {
  const [tip, setTip] = useState<number | null>(null);
  const [hop, setHop] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Escape or a tap elsewhere closes the bubble.
  useEffect(() => {
    if (tip === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTip(null);
    };
    const onPointer = (e: PointerEvent) => {
      if (!buttonRef.current?.parentElement?.contains(e.target as Node)) setTip(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [tip]);

  const seenRef = useRef(new Set<number>());

  const next = () => {
    const nextTip = tip === null ? 0 : (tip + 1) % MASCOT_TIPS.length;
    setTip(nextTip);
    setHop((h) => h + 1);
    playSfx('blip');
    seenRef.current.add(nextTip);
    if (seenRef.current.size === MASCOT_TIPS.length) unlockBadge('mascot-friend');
  };

  return (
    <div className={`relative shrink-0 ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={next}
        aria-label={tip === null ? 'Tap the astronaut for a tip' : 'Next tip from the astronaut'}
        className="px-buddy block w-16 md:w-44"
      >
        {/* key restarts the hop animation on every tap */}
        <span key={hop} className={`block ${hop ? 'px-hop' : 'px-float'}`}>
          <Mascot size={176} className="w-full h-auto" />
        </span>
      </button>
      <div aria-live="polite">
        {tip !== null && (
          <p className="px-bubble" data-testid="mascot-tip">
            {MASCOT_TIPS[tip]}
          </p>
        )}
      </div>
    </div>
  );
};

export default MascotBuddy;
