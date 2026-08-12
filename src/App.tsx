import { useState } from 'react';
import { SimClockProvider } from './lib/simClock';
import { Sidebar, type ModuleKey } from './components/Sidebar';
import { FrequencyTicker } from './components/FrequencyTicker';
import { Overview } from './components/Overview';
import { LoadScheduler } from './modules/LoadScheduler';
import { CoolingOptimizer } from './modules/CoolingOptimizer';
import { DemandResponse } from './modules/DemandResponse';
import { MicrogridAllocator } from './modules/MicrogridAllocator';

function App() {
  const [active, setActive] = useState<ModuleKey>('overview');

  return (
    <SimClockProvider>
      <div className="flex flex-col md:flex-row min-h-screen" style={{ background: 'var(--bg)' }}>
        <Sidebar active={active} onSelect={setActive} />
        <div className="flex-1 flex flex-col min-w-0">
          <FrequencyTicker />
          <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
            {active === 'overview' && <Overview onSelect={setActive} />}
            {active === 'load' && <LoadScheduler />}
            {active === 'cooling' && <CoolingOptimizer />}
            {active === 'dr' && <DemandResponse />}
            {active === 'microgrid' && <MicrogridAllocator />}
          </main>
        </div>
      </div>
    </SimClockProvider>
  );
}

export default App;
