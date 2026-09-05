import { useEffect, useRef, useCallback } from 'react';
import type { AlertLevel } from '@/types';

export function useAudioAlert() {
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const currentLevelRef = useRef<AlertLevel>('NORMAL');

  const ensureContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playBeep = useCallback((frequency: number, duration: number) => {
    const ctx = ensureContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [ensureContext]);

  const stopLoop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const setAlertLevel = useCallback((level: AlertLevel) => {
    const prev = currentLevelRef.current;
    currentLevelRef.current = level;

    // Play a beep on state change
    if (level !== prev) {
      if (level === 'EMERGENCY') {
        playBeep(880, 0.15);
      } else if (level === 'CRITICAL') {
        playBeep(660, 0.12);
      } else if (level === 'WARNING') {
        playBeep(440, 0.1);
      }
    }

    // Continuous tone for EMERGENCY
    stopLoop();
    if (level === 'EMERGENCY') {
      intervalRef.current = window.setInterval(() => {
        playBeep(880, 0.12);
      }, 600);
    }
  }, [playBeep, stopLoop]);

  useEffect(() => {
    return () => stopLoop();
  }, [stopLoop]);

  return { setAlertLevel, playBeep, stopLoop };
}
