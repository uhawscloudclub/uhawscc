import type { PixelIconName } from '@/lib/sprites';

/**
 * A tiny bus for the pixel toast ("LEVEL UP!", "Badge unlocked"). Anything
 * can call showPixelToast; the <PixelToaster /> in PageLayout shows it.
 */
export interface PixelToastMessage {
  kicker: string;
  title: string;
  body?: string;
  icon: PixelIconName;
}

const listeners = new Set<(msg: PixelToastMessage) => void>();

export function showPixelToast(msg: PixelToastMessage): void {
  listeners.forEach((l) => l(msg));
}

export function onPixelToast(listener: (msg: PixelToastMessage) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
