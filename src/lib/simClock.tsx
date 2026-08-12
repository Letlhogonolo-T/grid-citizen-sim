import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

interface SimClockValue {
  hour: number; // 0-23, can be fractional
  running: boolean;
  speed: number; // simulated hours per real second
  toggle: () => void;
  setSpeed: (s: number) => void;
  gridFrequency: number; // ~60Hz with small live wobble, purely cosmetic
}

const SimClockContext = createContext<SimClockValue | null>(null);

export function SimClockProvider({ children }: { children: ReactNode }) {
  const [hour, setHour] = useState(6);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(0.6);
  const [gridFrequency, setGridFrequency] = useState(60.0);
  const frameRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    function tick(now: number) {
      if (lastRef.current == null) lastRef.current = now;
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      if (running) {
        setHour((h) => (h + dt * speed) % 24);
        setGridFrequency(60 + (Math.random() - 0.5) * 0.06);
      }
      frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      lastRef.current = null;
    };
  }, [running, speed]);

  return (
    <SimClockContext.Provider
      value={{
        hour,
        running,
        speed,
        toggle: () => setRunning((r) => !r),
        setSpeed,
        gridFrequency,
      }}
    >
      {children}
    </SimClockContext.Provider>
  );
}

export function useSimClock() {
  const ctx = useContext(SimClockContext);
  if (!ctx) throw new Error('useSimClock must be used within SimClockProvider');
  return ctx;
}
