# Grid Citizen

**A simulation of how AI data centers could stop fighting their neighbors for power.**

Data center buildouts are colliding with local grids — rising residential
electricity rates, water-stressed cooling demand, and multi-year
interconnection backlogs. This project doesn't just visualize that tension;
it simulates four control strategies a data center operator could actually
run to reduce it.

Everything is driven by **synthetic data** (grid load, weather, pricing,
residential demand) generated with seeded pseudo-random curves, so the app
is fully self-contained — no API keys, no external data dependencies.

## Modules

| Module | What it does |
|---|---|
| **Load Scheduler** | Defers flexible/batch compute to hours when the local grid has spare headroom, instead of piling onto the evening peak. |
| **Cooling Optimizer** | Switches between a fixed conservative setpoint and a dynamic setpoint + free-air economizer, cutting both energy and water use. |
| **Demand Response Agent** | Automatically bids curtailable load into the grid when wholesale prices spike, turning the facility into a grid resource instead of just a draw on it. |
| **Microgrid Allocator** | Reprioritizes a shared solar + battery feeder so nearby homes are served before the data center takes its share. |

Each module shows a live-updating simulated clock, before/after charts, and
concrete metrics (MW shifted, kWh/gallons saved, $ earned, MWh of
residential shortfall avoided).

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Recharts for charting
- No backend — all simulation logic runs client-side against generated data

## Running locally

```bash
npm install
npm run dev
```

Then open the printed local URL. `npm run build` produces a static
production build in `dist/`.

## Design notes

The visual language borrows from utility control-room / SCADA monitoring
displays — a live grid-frequency ticker, mono readouts, and a graphite/cyan
palette — to reinforce that this is meant to feel like an operational tool,
not a marketing dashboard.

## Honest disclaimer

This is a **simulation for demonstration purposes**. The data is fabricated,
the control logic is illustrative rather than production-grade, and none of
it is connected to a real utility, weather feed, or data center. The goal is
to show the *shape* of the problem and the *shape* of a fix — not to ship a
real grid-management product.
