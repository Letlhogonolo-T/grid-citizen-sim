// Deterministic synthetic data generators.
// Everything here is fabricated/dummy data designed to look plausible,
// not pulled from any real utility or weather source.

// Simple seeded PRNG (mulberry32) so numbers are stable across renders.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export interface HourPoint {
  hour: number;
  label: string;
}

const hourLabel = (h: number) => {
  const period = h < 12 ? 'AM' : 'PM';
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}${period}`;
};

/** Baseline data center IT load (MW) across 24h — fairly flat with a slight daytime bump. */
export function generateBaselineLoad(seed = 1): number[] {
  const rand = mulberry32(seed);
  return HOURS.map((h) => {
    const dayBump = Math.sin(((h - 9) / 24) * Math.PI * 2) * 3;
    const noise = (rand() - 0.5) * 1.2;
    return Math.max(22, 40 + dayBump + noise);
  });
}

/** Grid headroom (MW of spare capacity) — dips hard during evening peak, high overnight. */
export function generateGridHeadroom(seed = 2): number[] {
  const rand = mulberry32(seed);
  return HOURS.map((h) => {
    // Evening peak (17:00–21:00) has the least headroom
    const peakDip = Math.exp(-Math.pow((h - 19) / 3, 2)) * 30;
    const base = 45 - peakDip;
    const noise = (rand() - 0.5) * 3;
    return Math.max(4, base + noise);
  });
}

/** Grid carbon intensity (gCO2/kWh) — lower overnight (wind), higher in evening (gas peakers). */
export function generateCarbonIntensity(seed = 3): number[] {
  const rand = mulberry32(seed);
  return HOURS.map((h) => {
    const evening = Math.exp(-Math.pow((h - 19) / 4, 2)) * 220;
    const solarDip = Math.exp(-Math.pow((h - 13) / 3, 2)) * 90;
    const base = 320 + evening - solarDip;
    const noise = (rand() - 0.5) * 15;
    return Math.max(60, base + noise);
  });
}

/** Ambient temperature (°C) across 24h — used to drive cooling load. */
export function generateAmbientTemp(seed = 4): number[] {
  const rand = mulberry32(seed);
  return HOURS.map((h) => {
    const daily = 22 + Math.sin(((h - 8) / 24) * Math.PI * 2) * 9;
    const noise = (rand() - 0.5) * 1.5;
    return daily + noise;
  });
}

/** Relative humidity (%) across 24h. */
export function generateHumidity(seed = 5): number[] {
  const rand = mulberry32(seed);
  return HOURS.map((h) => {
    const daily = 55 - Math.sin(((h - 8) / 24) * Math.PI * 2) * 15;
    const noise = (rand() - 0.5) * 4;
    return Math.min(95, Math.max(25, daily + noise));
  });
}

/** Utility demand-response price signal ($/MWh) — spikes during evening peak. */
export function generateDRPrice(seed = 6): number[] {
  const rand = mulberry32(seed);
  return HOURS.map((h) => {
    const spike = Math.exp(-Math.pow((h - 18.5) / 2.2, 2)) * 340;
    const base = 38 + spike;
    const noise = (rand() - 0.5) * 8;
    return Math.max(20, base + noise);
  });
}

/** Neighborhood residential demand (MW) sharing the same local feeder/microgrid. */
export function generateResidentialLoad(seed = 7): number[] {
  const rand = mulberry32(seed);
  return HOURS.map((h) => {
    const morning = Math.exp(-Math.pow((h - 7.5) / 1.5, 2)) * 8;
    const evening = Math.exp(-Math.pow((h - 19.5) / 2, 2)) * 14;
    const base = 6 + morning + evening;
    const noise = (rand() - 0.5) * 1;
    return Math.max(3, base + noise);
  });
}

/** Local solar generation (MW) feeding the shared microgrid — bell curve around midday. */
export function generateSolarGeneration(seed = 8): number[] {
  const rand = mulberry32(seed);
  return HOURS.map((h) => {
    const curve = Math.max(0, Math.sin(((h - 6) / 12) * Math.PI));
    const base = curve * 18;
    const noise = h > 6 && h < 19 ? (rand() - 0.5) * 1.2 : 0;
    return Math.max(0, base + noise);
  });
}

export const labels = HOURS.map(hourLabel);

export function withLabels<T>(series: T[]): { hour: number; label: string; value: T }[] {
  return HOURS.map((h) => ({ hour: h, label: labels[h], value: series[h] }));
}
