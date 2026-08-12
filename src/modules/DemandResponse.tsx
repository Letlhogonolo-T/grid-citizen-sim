import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { generateDRPrice, generateBaselineLoad, labels, HOURS } from '../lib/generators';
import { useSimClock } from '../lib/simClock';
import { MetricCard, Panel } from '../components/MetricCard';

const CURTAILABLE_FRACTION = 0.18; // share of IT load the facility is willing to shed on demand
const BID_THRESHOLD = 150; // $/MWh — price above which the agent automatically curtails

export function DemandResponse() {
  const { hour } = useSimClock();
  const hourIndex = Math.floor(hour);

  const { chartData, revenue, mwCurtailed, eventHours } = useMemo(() => {
    const price = generateDRPrice();
    const load = generateBaselineLoad();

    let revenueTotal = 0;
    let mwTotal = 0;
    let events = 0;

    const data = HOURS.map((h) => {
      const triggered = price[h] >= BID_THRESHOLD;
      const curtailedMW = triggered ? load[h] * CURTAILABLE_FRACTION : 0;
      const hourlyRevenue = curtailedMW * price[h];
      if (triggered) {
        events += 1;
        mwTotal += curtailedMW;
        revenueTotal += hourlyRevenue;
      }
      return {
        hour: h,
        label: labels[h],
        price: Number(price[h].toFixed(0)),
        curtailedMW: Number(curtailedMW.toFixed(1)),
        triggered,
      };
    });

    return { chartData: data, revenue: revenueTotal, mwCurtailed: mwTotal, eventHours: events };
  }, []);

  const current = chartData[hourIndex];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl">Demand Response Agent</h2>
        <p className="text-sm mt-1 max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          When wholesale prices spike, it's usually because the grid itself is
          under stress. Instead of ignoring that signal, this agent
          automatically sheds a slice of curtailable load — and gets paid for
          it — turning the data center into a resource the grid can lean on
          during peak events rather than just another draw on it.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="DR revenue" value={`$${revenue.toFixed(0)}`} unit="/day" accent="cyan" />
        <MetricCard label="Load curtailed" value={mwCurtailed.toFixed(1)} unit="MWh" accent="violet" hint="shed during price events" />
        <MetricCard label="Bid events" value={String(eventHours)} unit="hrs" accent="amber" hint={`price ≥ $${BID_THRESHOLD}/MWh`} />
        <MetricCard
          label="Current price"
          value={String(current.price)}
          unit="$/MWh"
          accent={current.triggered ? 'amber' : 'cyan'}
          hint={current.triggered ? 'curtailing now' : 'below bid threshold'}
        />
      </div>

      <Panel title="Price signal & curtailment" subtitle={`Agent bids in automatically once price crosses $${BID_THRESHOLD}/MWh.`}>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--text-dim)" tick={{ fontSize: 11 }} interval={2} />
            <YAxis yAxisId="price" stroke="var(--text-dim)" tick={{ fontSize: 11 }} width={44} unit=" $" />
            <YAxis yAxisId="mw" orientation="right" stroke="var(--text-dim)" tick={{ fontSize: 11 }} width={40} unit=" MW" />
            <Tooltip contentStyle={{ background: 'var(--panel-raised)', border: '1px solid var(--border-bright)', borderRadius: 6, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine yAxisId="price" y={BID_THRESHOLD} stroke="var(--red)" strokeDasharray="3 3" label={{ value: 'Bid threshold', fill: 'var(--red)', fontSize: 10, position: 'insideTopRight' }} />
            <Line yAxisId="price" type="monotone" dataKey="price" name="DR price ($/MWh)" stroke="var(--text-muted)" strokeWidth={1.5} dot={false} />
            <Bar yAxisId="mw" dataKey="curtailedMW" name="Curtailed (MW)" fill="var(--cyan)" radius={[3, 3, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}
