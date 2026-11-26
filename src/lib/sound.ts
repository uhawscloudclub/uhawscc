import { useSyncExternalStore } from 'react';

/**
 * Optional 8-bit sound effects, made with Web Audio square waves (no audio
 * files to download). Off by default; the choice is saved in this browser.
 * Nothing plays until the visitor turns sound on, which is itself a tap, so
 * browsers' autoplay rules are satisfied.
 */

export type Sfx = 'blip' | 'coin' | 'levelup' | 'hurt';

const KEY = 'uh_aws_sbg_sound_v1';
const listeners = new Set<() => void>();
let enabled: boolean | null = null;
let ctx: AudioContext | null = null;

function read(): boolean {
  if (enabled === null) {
    try {
      enabled = localStorage.getItem(KEY) === 'on';
    } catch {
      enabled = false;
    }
  }
  return enabled;
}

export function setSoundEnabled(on: boolean): void {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // not saved; still applies for this visit
  }
  listeners.forEach((l) => l());
  if (on) playSfx('blip');
}

export function useSoundEnabled(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => false,
  );
}

// Notes as [frequency Hz, start s, length s].
const TUNES: Record<Sfx, Array<[number, number, number]>> = {
  blip: [[880, 0, 0.06]],
  coin: [[988, 0, 0.07], [1319, 0.07, 0.16]],
  levelup: [[523, 0, 0.08], [659, 0.08, 0.08], [784, 0.16, 0.08], [1047, 0.24, 0.2]],
  hurt: [[220, 0, 0.08], [147, 0.08, 0.16]],
};

export function playSfx(name: Sfx): void {
  if (!read() || typeof window === 'undefined') return;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  try {
    ctx ??= new Ctor();
    if (ctx.state === 'suspended') void ctx.resume();
    const now = ctx.currentTime;
    for (const [freq, start, len] of TUNES[name]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.05, now + start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + len);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + len + 0.02);
    }
  } catch {
    // Audio unavailable: stay silent.
  }
}

/** Test helper. */
export function resetSoundForTests(): void {
  enabled = null;
}
