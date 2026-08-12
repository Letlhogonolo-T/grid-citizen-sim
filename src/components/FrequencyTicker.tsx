import { Pause, Play } from 'lucide-react';
import { useSimClock } from '../lib/simClock';
import { labels } from '../lib/generators';

export function FrequencyTicker() {
  const { hour, running, toggle, gridFrequency, speed, setSpeed } = useSimClock();
  const hourIndex = Math.floor(hour);
  const freqOk = gridFrequency > 59.95 && gridFrequency < 60.05;

  return (
    <header
      className="flex items-center gap-4 md:gap-6 px-4 md:px-6 py-3 border-b overflow-x-auto"
      style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
    >
      <button
        onClick={toggle}
        className="flex items-center gap-2 px-3 py-1.5 rounded border shrink-0"
        style={{ borderColor: 'var(--border-bright)', background: 'var(--panel-raised)' }}
        aria-label={running ? 'Pause simulation' : 'Resume simulation'}
      >
        {running ? <Pause size={13} /> : <Play size={13} />}
        <span className="font-mono text-xs">{running ? 'Running' : 'Paused'}</span>
      </button>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>
          Speed
        </span>
        {[0.2, 0.6, 2].map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className="font-mono text-xs px-2 py-1 rounded"
            style={{
              background: speed === s ? 'var(--cyan)' : 'transparent',
              color: speed === s ? '#04120f' : 'var(--text-muted)',
              border: `1px solid ${speed === s ? 'var(--cyan)' : 'var(--border-bright)'}`,
            }}
          >
            {s}x
          </button>
        ))}
      </div>

      <div className="w-px h-6 shrink-0" style={{ background: 'var(--border)' }} />

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>
          Sim time
        </span>
        <span className="font-mono text-sm" style={{ color: 'var(--text)' }}>
          {labels[hourIndex]}
        </span>
      </div>

      <div className="w-px h-6 shrink-0" style={{ background: 'var(--border)' }} />

      <div className="flex items-center gap-2 shrink-0">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: freqOk ? 'var(--cyan)' : 'var(--amber)' }}
        />
        <span className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>
          Grid freq
        </span>
        <span className="font-mono text-sm tabular-nums" style={{ color: freqOk ? 'var(--text)' : 'var(--amber)' }}>
          {gridFrequency.toFixed(3)} Hz
        </span>
      </div>

      <div className="ml-auto hidden lg:flex items-center gap-1.5 shrink-0">
        {labels.map((_, i) => (
          <span
            key={i}
            className="w-1 h-1 rounded-full"
            style={{ background: i === hourIndex ? 'var(--cyan)' : 'var(--border-bright)' }}
          />
        ))}
      </div>
    </header>
  );
}
