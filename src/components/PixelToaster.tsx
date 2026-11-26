import { useEffect, useState } from 'react';
import PixelIcon from '@/components/PixelIcon';
import { onPixelToast, type PixelToastMessage } from '@/lib/pixelToast';

const SHOW_MS = 4500;

/**
 * Shows pixel toasts ("LEVEL UP!", "Badge unlocked") at the bottom of the
 * screen, one at a time, queued. A polite live region announces each one.
 * The pixel burst around it is CSS and skipped for reduced motion.
 */
const PixelToaster = () => {
  const [queue, setQueue] = useState<Array<PixelToastMessage & { key: number }>>([]);

  useEffect(() => {
    let n = 0;
    return onPixelToast((msg) => setQueue((q) => [...q, { ...msg, key: ++n }]));
  }, []);

  const current = queue[0];

  useEffect(() => {
    if (!current) return;
    const id = window.setTimeout(() => setQueue((q) => q.slice(1)), SHOW_MS);
    return () => window.clearTimeout(id);
  }, [current]);

  return (
    <div aria-live="polite" className="px-toast-region">
      {current && (
        <div key={current.key} className="px-toast" data-testid="pixel-toast">
          <span className="px-toast-burst" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => <span key={i} />)}
          </span>
          <span className="px-toast-icon" aria-hidden="true">
            <PixelIcon name={current.icon} size={27} />
          </span>
          <span className="min-w-0">
            <span className="px-toast-kicker">{current.kicker}</span>
            <span className="block font-bold leading-snug">{current.title}</span>
            {current.body && <span className="block text-sm leading-snug mt-0.5">{current.body}</span>}
          </span>
          <button
            type="button"
            onClick={() => setQueue((q) => q.slice(1))}
            className="px-toast-close"
            aria-label="Dismiss"
          >
            <PixelIcon name="close" size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PixelToaster;
