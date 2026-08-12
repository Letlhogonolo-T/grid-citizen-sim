import { useMemo } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { generateResidentialLoad, generateSolarGeneration, labels, HOURS } from '../lib/generators';
import { useSimClock } from '../lib/simClock';
import { MetricCard, Panel } from '../components/MetricCard';

const DC_TARGET_MW = 12; // data center's steady-state draw from the shared microgrid

// Stylized evening battery release — stored daytime solar dispatched during the peak.
function batteryAssist(h: number) {
  return Math.max(0, Math.exp(-Math.pow((h - 19) / 2.5, 2)) * 9);
}

export function MicrogridAllocator() {
  const { hour } = useSimClock();
  const hourIndex = Math.floor(hour);

  const { chartData, shortfallAvoided, dcGiveUp, fairnessPct } = useMemo(() => {
    const solar = generateSolarGeneration();
    const resLoad = generateResidentialLoad();

    let shortfallBaselineTotal = 0;
    let shortfallFairTotal = 0;
    let dcGiveUpTotal = 0;

    const data = HOURS.map((h) => {
      const supply = solar[h] + batteryAssist(h);

      // Baseline: data center takes its fixed allocation first, residents get the rest.
      const dcBaseline = DC_TARGET_MW;
      const resSuppliedBaseline = Math.min(resLoad[h], Math.max(0, supply - dcBaseline));
      const shortfallBaseline = resLoad[h] - resSuppliedBaseline;

      // Fair allocator: residents are served first, data center absorbs the remainder
      // (and throttles itself when the microgrid is tight).
      const resSuppliedFair = Math.min(resLoad[h], supply);
      const remaining = Math.max(0, supply - resSuppliedFair);
      const dcFair = Math.min(DC_TARGET_MW, remaining);
      const shortfallFair = resLoad[h] - resSuppliedFair;

      shortfallBaselineTotal += shortfallBaseline;
      shortfallFairTotal += shortfallFair;
      dcGiveUpTotal += Math.max(0, dcBaseline - dcFair);

      return {
        hour: h,
        label: labels[h],
        supply: Number(supply.toFixed(1)),
        resLoad: Number(resLoad[h].toFixed(1)),
        dcBaseline: Number(dcBaseline.toFixed(1)),
        dcFair: Number(dcFair.toFixed(1)),
        shortfallBaseline: Number(shortfallBaseline.toFixed(1)),
      };
    });

    return {
      chartData: data,
      shortfallAvoided: shortfallBaselineTotal - shortfallFairTotal,
      dcGiveUp: dcGiveUpTotal,
      fairnessPct: 100 - (shortfallFairTotal / Math.max(1, shortfallBaselineTotal)) * 100,
    };
  }, []);

  const current = chartData[hourIndex];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl">Microgrid Allocator</h2>
        <p className="text-sm mt-1 max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          On a shared local feeder — solar plus a battery serving both the
          facility and nearby homes — first-come allocation lets the data
          center's steady draw crowd out residents right when they need power
          most. This allocator flips the priority: homes are served first,
          and the data center absorbs what's left, throttling itself when the
          microgrid is tight.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Residential shortfall avoided" value={shortfallAvoided.toFixed(1)} unit="MWh" accent="cyan" />
        <MetricCard label="DC load given up" value={dcGiveUp.toFixed(1)} unit="MWh" accent="amber" hint="throttled to keep homes whole" />
        <MetricCard label="Fairness score" value={fairnessPct.toFixed(0)} unit="%" accent="violet" hint="residential demand met vs. baseline" />
        <MetricCard
          label="Current DC allocation"
          value={current.dcFair.toFixed(1)}
          unit="MW"
          accent="cyan"
          hint={`target was ${current.dcBaseline.toFixed(1)} MW`}
        />
      </div>

      <Panel title="Shared microgrid supply & demand" subtitle="Solar + battery supply against residential load and data-center draw.">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="supplyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--text-dim)" tick={{ fontSize: 11 }} interval={2} />
            <YAxis stroke="var(--text-dim)" tick={{ fontSize: 11 }} width={40} unit=" MW" />
            <Tooltip contentStyle={{ background: 'var(--panel-raised)', border: '1px solid var(--border-bright)', borderRadius: 6, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="supply" name="Solar + battery supply" stroke="var(--cyan)" fill="url(#supplyFill)" strokeWidth={2} />
            <Line type="monotone" dataKey="resLoad" name="Residential demand" stroke="var(--violet)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="dcFair" name="DC draw (fair mode)" stroke="var(--amber)" strokeWidth={2} dot={false} strokeDasharray="4 2" />
          </ComposedChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Residential shortfall under first-come allocation" subtitle="Unmet home demand when the data center takes its share first.">
        <ResponsiveContainer width="100%" height={140}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--text-dim)" tick={{ fontSize: 11 }} interval={2} />
            <YAxis stroke="var(--text-dim)" tick={{ fontSize: 11 }} width={40} unit=" MW" />
            <Tooltip contentStyle={{ background: 'var(--panel-raised)', border: '1px solid var(--border-bright)', borderRadius: 6, fontSize: 12 }} />
            <Area type="monotone" dataKey="shortfallBaseline" name="Unmet residential demand" stroke="var(--red)" fill="var(--red)" fillOpacity={0.2} strokeWidth={1.5} />
          </ComposedChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}
