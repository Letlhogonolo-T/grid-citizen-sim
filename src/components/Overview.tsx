import { Zap, Snowflake, HandCoins, Share2, ArrowRight } from 'lucide-react';
import type { ModuleKey } from './Sidebar';

const cards: {
  key: ModuleKey;
  icon: typeof Zap;
  title: string;
  desc: string;
  stat: string;
  statLabel: string;
  accent: 'cyan' | 'amber' | 'violet' | 'red';
}[] = [
  {
    key: 'load',
    icon: Zap,
    title: 'Load Scheduler',
    desc: 'Defers flexible compute to hours when the local grid has spare headroom, instead of piling onto the evening peak.',
    stat: '~30%',
    statLabel: 'of IT load is deferrable',
    accent: 'cyan',
  },
  {
    key: 'cooling',
    icon: Snowflake,
    title: 'Cooling Optimizer',
    desc: 'Widens setpoints and switches to free outside-air cooling whenever conditions allow, cutting energy and water together.',
    stat: '2 levers',
    statLabel: 'setpoint + free-air mode',
    accent: 'amber',
  },
  {
    key: 'dr',
    icon: HandCoins,
    title: 'Demand Response Agent',
    desc: 'Automatically bids curtailable load into the grid during price spikes — getting paid to ease stress instead of adding to it.',
    stat: '18%',
    statLabel: 'of load is curtailable',
    accent: 'violet',
  },
  {
    key: 'microgrid',
    icon: Share2,
    title: 'Microgrid Allocator',
    desc: 'Reprioritizes a shared solar + battery feeder so nearby homes are served before the data center takes its share.',
    stat: 'Homes first',
    statLabel: 'fair-share dispatch order',
    accent: 'red',
  },
];

export function Overview({ onSelect }: { onSelect: (k: ModuleKey) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl">Four ways to be a better grid citizen</h2>
        <p className="text-sm mt-2 max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Data center buildouts are colliding with local grids: rising
          residential rates, water-stressed cooling demand, and multi-year
          interconnection backlogs. None of that gets fixed by a dashboard —
          it gets fixed by changing how load, cooling, and shared
          infrastructure actually behave. This is a synthetic-data simulation
          of four control strategies that do that.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map(({ key, icon: Icon, title, desc, stat, statLabel, accent }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="text-left rounded-lg border p-5 flex flex-col gap-3 transition-colors hover:border-[var(--border-bright)] group"
            style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
          >
            <div className="flex items-start justify-between">
              <Icon size={20} strokeWidth={1.6} style={{ color: `var(--${accent})` }} />
              <ArrowRight
                size={16}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-dim)' }}
              />
            </div>
            <h3 className="font-display text-base">{title}</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {desc}
            </p>
            <div className="mt-1 pt-3 border-t flex items-baseline gap-2" style={{ borderColor: 'var(--border)' }}>
              <span className="font-mono text-lg" style={{ color: `var(--${accent})` }}>
                {stat}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
                {statLabel}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div
        className="rounded-lg border p-4 text-xs leading-relaxed"
        style={{ borderColor: 'var(--border)', background: 'var(--panel)', color: 'var(--text-dim)' }}
      >
        Note on the data: every curve in this app — grid load, weather,
        pricing, residential demand — is generated synthetically to look
        plausible. Nothing here is pulled from a real utility, and the
        control logic is illustrative rather than production-grade. The goal
        is to demonstrate the shape of the problem and the shape of a fix.
      </div>
    </div>
  );
}
