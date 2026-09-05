import { useState, useCallback } from 'react';
import { NavBar } from '@/components/NavBar';
import { DriverHUD } from '@/components/DriverHUD';
import { ControlRoom } from '@/components/ControlRoom';
import { useSimulation } from '@/hooks/useSimulation';
import { useAudioAlert } from '@/hooks/useAudioAlert';
import type { ViewMode, AlertLevel } from '@/types';

function App() {
  const [view, setView] = useState<ViewMode>('hud');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const { state, triggerApproach, resetSimulation, setSimSpeed } = useSimulation();
  const { setAlertLevel, stopLoop } = useAudioAlert();

  const handleAlertChange = useCallback((level: AlertLevel) => {
    if (audioEnabled) {
      setAlertLevel(level);
    } else {
      stopLoop();
    }
  }, [audioEnabled, setAlertLevel, stopLoop]);

  const handleToggleAudio = useCallback(() => {
    setAudioEnabled((prev) => {
      if (prev) stopLoop();
      return !prev;
    });
  }, [stopLoop]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <NavBar view={view} onViewChange={setView} alertLevel={state.alertLevel} />
      {view === 'hud' ? (
        <DriverHUD
          state={state}
          onTriggerApproach={triggerApproach}
          onReset={resetSimulation}
          onSetSimSpeed={setSimSpeed}
          onAlertChange={handleAlertChange}
          audioEnabled={audioEnabled}
          onToggleAudio={handleToggleAudio}
        />
      ) : (
        <ControlRoom state={state} />
      )}
    </div>
  );
}

export default App;
