import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { generateBaselineLoad, generateGridHeadroom, labels, HOURS } from '../lib/generators';
import { useSimClock } from '../lib/simClock';
import { MetricCard, Panel } from '../components/MetricCard';

const FLEXIBLE_FRACTION = 0.34; // share of IT load assumed to be deferrable (batch/training jobs)

export function LoadScheduler() {
  const { hour } = useSimClock();
  const hourIndex = Math.floor(hour);

  const { chartData, peakReduction, mwhShifted, flexibleMWh } = useMemo(() => {
    const baseline = generateBaselineLoad();
    const headroom = generateGridHeadroom();

    const fixed = baseline.map((v) => v * (1 - FLEXIBLE_FRACTION));
    const flexiblePool = baseline.reduce((s, v) => s + v * FLEXIBLE_FRACTION, 0);

    // Allocate the flexible pool proportional to available grid headroom —
    // more spare capacity in an hour means more deferrable compute lands there.
    const headroomSum = headroom.reduce((s, v) => s + v, 0);
    const allocated = headroom.map((h) => (h / headroomSum) * flexiblePool);

    const optimized = fixed.map((v, i) => v + allocated[i]);

    const data = HOURS.map((h) => ({
      hour: h,
      label: labels[h],
      baseline: Number(baseline[h].toFixed(1)),
      optimized: Number(optimized[h].toFixed(1)),
      headroom: Number(headroom[h].toFixed(1)),
    }));

    const peakBaseline = Math.max(...baseline);
    const peakOptimized = Math.max(...optimized);
    const shifted = baseline.reduce((s, v, i) => s + Math.abs(v * FLEXIBLE_FRACTION - allocated[i]), 0) / 2;

    return {
      chartData: data,
      peakReduction: peakBaseline - peakOptimized,
      mwhShifted: shifted,
      flexibleMWh: flexiblePool,
    };
  }, []);

  const current = chartData[hourIndex];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl">Load Scheduler</h2>
        <p className="text-sm mt-1 max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          About a third of a typical data center's compute — batch jobs, model
          training, offline rendering — doesn't care exactly when it runs, only
          that it finishes by some deadline. This scheduler holds that flexible
          slice and releases it into the hours when the local grid actually has
          spare capacity, instead of piling onto the evening peak.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Peak load reduced"
          value={peakReduction.toFixed(1)}
          unit="MW"
          accent="cyan"
          hint="vs. running everything on demand"
        />
        <MetricCard
          label="Flexible compute pool"
          value={flexibleMWh.toFixed(0)}
          unit="MWh/day"
          accent="violet"
          hint={`${Math.round(FLEXIBLE_FRACTION * 100)}% of total IT load`}
        />
        <MetricCard
          label="MWh shifted off-peak"
          value={mwhShifted.toFixed(0)}
          unit="MWh"
          accent="amber"
          hint="moved to higher-headroom hours"
        />
        <MetricCard
          label="Current hour load"
          value={current.optimized.toFixed(1)}
          unit="MW"
          accent="cyan"
          hint={`baseline was ${current.baseline.toFixed(1)} MW`}
        />
      </div>

      <Panel
        title="Scheduled vs. unscheduled draw"
        subtitle="Optimized load tracks grid headroom; baseline just follows demand."
      >
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="baselineFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--text-dim)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--text-dim)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="optimizedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--text-dim)" tick={{ fontSize: 11 }} interval={2} />
            <YAxis stroke="var(--text-dim)" tick={{ fontSize: 11 }} width={40} unit=" MW" />
            <Tooltip
              contentStyle={{ background: 'var(--panel-raised)', border: '1px solid var(--border-bright)', borderRadius: 6, fontSize: 12 }}
              labelStyle={{ color: 'var(--text)' }}
            />
            <ReferenceLine x={labels[hourIndex]} stroke="var(--amber)" strokeDasharray="3 3" />
            <Area type="monotone" dataKey="baseline" name="Baseline (unscheduled)" stroke="var(--text-dim)" fill="url(#baselineFill)" strokeWidth={1.5} />
            <Area type="monotone" dataKey="optimized" name="Optimized (scheduled)" stroke="var(--cyan)" fill="url(#optimizedFill)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Grid headroom this cycle" subtitle="Spare local capacity (MW) the scheduler is chasing.">
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="headroomFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--amber)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--amber)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--text-dim)" tick={{ fontSize: 11 }} interval={2} />
            <YAxis stroke="var(--text-dim)" tick={{ fontSize: 11 }} width={40} unit=" MW" />
            <Tooltip contentStyle={{ background: 'var(--panel-raised)', border: '1px solid var(--border-bright)', borderRadius: 6, fontSize: 12 }} />
            <Area type="monotone" dataKey="headroom" stroke="var(--amber)" fill="url(#headroomFill)" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}
