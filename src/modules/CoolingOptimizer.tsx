import { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { generateAmbientTemp, generateHumidity, labels, HOURS } from '../lib/generators';
import { useSimClock } from '../lib/simClock';
import { MetricCard, Panel } from '../components/MetricCard';

// Illustrative constants — not derived from any real HVAC model.
const FREE_COOLING_THRESHOLD = 15; // °C ambient below which outside air alone can cool the hall
const ASHRAE_ALLOWABLE = 27; // °C, modern allowable supply temp ceiling

export function CoolingOptimizer() {
  const { hour } = useSimClock();
  const hourIndex = Math.floor(hour);

  const { chartData, kwhSaved, gallonsSaved, pctFreeCooling } = useMemo(() => {
    const temp = generateAmbientTemp();
    const humidity = generateHumidity();

    let kwhSavedTotal = 0;
    let gallonsSavedTotal = 0;
    let freeCoolingHours = 0;

    const data = HOURS.map((h) => {
      const t = temp[h];
      const rh = humidity[h];

      // Baseline: always mechanically chills to a fixed setpoint.
      const baselinePower = Math.max(4, (t - 5) * 2.6);
      const humidityFactor = 1 + (rh - 50) / 140;
      const baselineWater = Math.max(0, baselinePower * 0.55 * humidityFactor);

      // Optimized: free-air economizer below threshold, wider allowable band above it.
      const usesFreeCooling = t < FREE_COOLING_THRESHOLD;
      let optimizedPower: number;
      let optimizedWater: number;
      if (usesFreeCooling) {
        optimizedPower = 3.2; // fans only
        optimizedWater = 0;
        freeCoolingHours += 1;
      } else {
        const effectiveDelta = Math.max(0, t - (ASHRAE_ALLOWABLE - 10));
        optimizedPower = Math.max(3.5, effectiveDelta * 1.7);
        optimizedWater = Math.max(0, optimizedPower * 0.32 * humidityFactor);
      }

      kwhSavedTotal += baselinePower - optimizedPower;
      gallonsSavedTotal += baselineWater - optimizedWater;

      return {
        hour: h,
        label: labels[h],
        temp: Number(t.toFixed(1)),
        humidity: Number(rh.toFixed(0)),
        baselinePower: Number(baselinePower.toFixed(1)),
        optimizedPower: Number(optimizedPower.toFixed(1)),
        freeCooling: usesFreeCooling,
      };
    });

    return {
      chartData: data,
      kwhSaved: kwhSavedTotal,
      gallonsSaved: gallonsSavedTotal * 60, // scale to a plausible facility-level gallons/day
      pctFreeCooling: (freeCoolingHours / 24) * 100,
    };
  }, []);

  const current = chartData[hourIndex];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl">Cooling Optimizer</h2>
        <p className="text-sm mt-1 max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Most of a facility's water and a large share of its non-IT power goes
          to keeping equipment cool. This module swaps a fixed, conservative
          setpoint for one that widens with modern equipment tolerances and
          switches to free outside-air cooling whenever the weather allows it —
          cutting both mechanical load and evaporative water draw.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Cooling energy saved" value={kwhSaved.toFixed(0)} unit="kWh/day" accent="cyan" />
        <MetricCard label="Water saved" value={gallonsSaved.toFixed(0)} unit="gal/day" accent="violet" />
        <MetricCard label="Hours on free-air cooling" value={pctFreeCooling.toFixed(0)} unit="%" accent="amber" hint="of the 24h cycle" />
        <MetricCard
          label="Current mode"
          value={current.freeCooling ? 'Free-air' : 'Mechanical'}
          accent={current.freeCooling ? 'cyan' : 'amber'}
          hint={`${current.temp}°C ambient, ${current.humidity}% RH`}
        />
      </div>

      <Panel title="Cooling power draw" subtitle="Fixed setpoint vs. dynamic + free-air economizer, by hour.">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--text-dim)" tick={{ fontSize: 11 }} interval={2} />
            <YAxis stroke="var(--text-dim)" tick={{ fontSize: 11 }} width={40} unit=" kW" />
            <Tooltip contentStyle={{ background: 'var(--panel-raised)', border: '1px solid var(--border-bright)', borderRadius: 6, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="baselinePower" name="Fixed setpoint" fill="var(--text-dim)" radius={[3, 3, 0, 0]} />
            <Line type="monotone" dataKey="optimizedPower" name="Dynamic + free-air" stroke="var(--cyan)" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Ambient conditions" subtitle="Outside temperature drives when free cooling is available.">
        <ResponsiveContainer width="100%" height={140}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--text-dim)" tick={{ fontSize: 11 }} interval={2} />
            <YAxis stroke="var(--text-dim)" tick={{ fontSize: 11 }} width={40} unit="°C" />
            <Tooltip contentStyle={{ background: 'var(--panel-raised)', border: '1px solid var(--border-bright)', borderRadius: 6, fontSize: 12 }} />
            <Line type="monotone" dataKey="temp" name="Ambient temp" stroke="var(--amber)" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}
