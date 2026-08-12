import { LayoutGrid, Zap, Snowflake, HandCoins, Share2 } from 'lucide-react';

export type ModuleKey = 'overview' | 'load' | 'cooling' | 'dr' | 'microgrid';

interface NavItem {
  key: ModuleKey;
  label: string;
  sub: string;
  icon: typeof LayoutGrid;
}

const items: NavItem[] = [
  { key: 'overview', label: 'Overview', sub: 'System status', icon: LayoutGrid },
  { key: 'load', label: 'Load Scheduler', sub: 'Shift flexible compute', icon: Zap },
  { key: 'cooling', label: 'Cooling Optimizer', sub: 'Setpoint + water use', icon: Snowflake },
  { key: 'dr', label: 'Demand Response', sub: 'Bid load into the grid', icon: HandCoins },
  { key: 'microgrid', label: 'Microgrid Allocator', sub: 'Share solar + battery', icon: Share2 },
];

export function Sidebar({
  active,
  onSelect,
}: {
  active: ModuleKey;
  onSelect: (k: ModuleKey) => void;
}) {
  return (
    <nav
      className="flex flex-col shrink-0 w-full md:w-64 border-b md:border-b-0 md:border-r"
      style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
    >
      <div className="px-5 pt-6 pb-5 hidden md:block">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full pulse-dot"
            style={{ background: 'var(--cyan)' }}
          />
          <span className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'var(--text-dim)' }}>
            Simulation live
          </span>
        </div>
        <h1 className="font-display text-xl mt-2 leading-tight">
          Grid Citizen<span style={{ color: 'var(--cyan)' }}>.</span>
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Four ways a data center can stop fighting its neighbors for power.
        </p>
      </div>

      <div className="flex md:flex-col overflow-x-auto md:overflow-visible px-2 md:px-3 pb-2 md:pb-6 gap-1">
        {items.map(({ key, label, sub, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="flex items-center gap-3 text-left px-3 py-2.5 rounded-md transition-colors shrink-0 md:shrink"
              style={{
                background: isActive ? 'var(--panel-raised)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--cyan)' : '2px solid transparent',
              }}
            >
              <Icon
                size={16}
                strokeWidth={1.75}
                style={{ color: isActive ? 'var(--cyan)' : 'var(--text-muted)' }}
              />
              <span className="hidden md:block">
                <span
                  className="block text-sm font-medium"
                  style={{ color: isActive ? 'var(--text)' : 'var(--text-muted)' }}
                >
                  {label}
                </span>
                <span className="block text-[11px]" style={{ color: 'var(--text-dim)' }}>
                  {sub}
                </span>
              </span>
              <span
                className="md:hidden text-xs font-medium whitespace-nowrap"
                style={{ color: isActive ? 'var(--text)' : 'var(--text-muted)' }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto px-5 py-4 hidden md:block border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          All data is synthetic. Built to demonstrate simulation &amp; control
          logic, not a production grid tool.
        </p>
      </div>
    </nav>
  );
}
