import { useEffect } from 'react';
import {
  Gauge, Navigation, MapPin, Eye, Thermometer, Radio,
  Radar, Mountain, Satellite, AlertTriangle, Shield,
  TrendingDown, Volume2, VolumeX, Car, RotateCcw, Zap,
} from 'lucide-react';
import type { SimulationState } from '@/hooks/useSimulation';
import type { AlertLevel } from '@/types';
import { ALERT_COLORS } from '@/types';

interface DriverHUDProps {
  state: SimulationState;
  onTriggerApproach: () => void;
  onReset: () => void;
  onSetSimSpeed: (speed: number) => void;
  onAlertChange: (level: AlertLevel) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export function DriverHUD({
  state, onTriggerApproach, onReset, onSetSimSpeed,
  onAlertChange, audioEnabled, onToggleAudio,
}: DriverHUDProps) {
  const { alertLevel, telemetry, sensors, distance } = state;
  const colors = ALERT_COLORS[alertLevel];
  const isEmergency = alertLevel === 'EMERGENCY';

  useEffect(() => {
    onAlertChange(alertLevel);
  }, [alertLevel, onAlertChange]);

  return (
    <div className={`min-h-[calc(100vh-65px)] grid-bg bg-slate-950 transition-all duration-300 ${
      isEmergency ? 'animate-flash-red' : ''
    }`}>
      <div className={`mx-auto max-w-[1600px] px-4 py-6 transition-all duration-300`}>
        {/* Alert Banner */}
        <div className={`mb-6 overflow-hidden rounded-2xl border-2 ${colors.border} ${colors.bg} ${colors.glow} transition-all duration-300`}>
          <div className="flex flex-col items-center justify-between gap-4 p-5 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${colors.badge} ${
                isEmergency ? 'animate-pulse' : ''
              }`}>
                {alertLevel === 'NORMAL' ? <Shield className="h-7 w-7" /> :
                 alertLevel === 'WARNING' ? <AlertTriangle className="h-7 w-7" /> :
                 alertLevel === 'CRITICAL' ? <AlertTriangle className="h-7 w-7" /> :
                 <AlertTriangle className="h-7 w-7" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-black tracking-tight ${colors.text} sm:text-3xl`}>
                    {alertLevel}
                  </span>
                  <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${colors.badge}`}>
                    TTC
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  Time-to-Collision Distance: <span className={`font-mono font-bold ${colors.text}`}>{distance.toFixed(1)} m</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-slate-500">Distance Threshold</p>
                <p className="font-mono text-sm text-slate-300">
                  {alertLevel === 'NORMAL' && '> 50m'}
                  {alertLevel === 'WARNING' && '15m - 30m'}
                  {alertLevel === 'CRITICAL' && '5m - 15m'}
                  {alertLevel === 'EMERGENCY' && '< 5m'}
                </p>
              </div>
              <button
                onClick={onToggleAudio}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 transition hover:bg-slate-800"
                title={audioEnabled ? 'Mute alerts' : 'Unmute alerts'}
              >
                {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sensor Metrics */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SensorCard
            icon={<Thermometer className="h-5 w-5" />}
            label="Thermal LWIR"
            value={`${sensors.thermalLWIR.toFixed(1)}°C`}
            sub="Long-Wave Infrared"
            color="text-orange-400"
          />
          <SensorCard
            icon={<Radar className="h-5 w-5" />}
            label="77GHz Radar"
            value={`${sensors.radar77GHz.toFixed(0)} m`}
            sub="Object Detection"
            color="text-cyan-400"
          />
          <SensorCard
            icon={<Mountain className="h-5 w-5" />}
            label="LiDAR"
            value={`${sensors.lidar.toFixed(0)} m`}
            sub="3D Point Cloud"
            color="text-emerald-400"
          />
          <SensorCard
            icon={<Satellite className="h-5 w-5" />}
            label="DGPS-RTK"
            value={sensors.dgpsRtkFix}
            sub="Positioning Fix"
            color={sensors.dgpsRtkFix === 'FIX' ? 'text-emerald-400' : 'text-yellow-400'}
          />
        </div>

        {/* Telemetry + Controls */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Live Telemetry */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
                  <Gauge className="h-4 w-4 text-amber-500" />
                  Live Telemetry
                </h2>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
                  LIVE
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <TelemetryItem
                  icon={<Gauge className="h-4 w-4" />}
                  label="Speed"
                  value={telemetry.speed.toFixed(2)}
                  unit="m/s"
                  color="text-amber-400"
                />
                <TelemetryItem
                  icon={<Navigation className="h-4 w-4" />}
                  label="Heading"
                  value={telemetry.heading.toFixed(0)}
                  unit="°"
                  color="text-cyan-400"
                />
                <TelemetryItem
                  icon={<MapPin className="h-4 w-4" />}
                  label="GPS Lat"
                  value={telemetry.gpsLat.toFixed(6)}
                  unit="°N"
                  color="text-emerald-400"
                />
                <TelemetryItem
                  icon={<MapPin className="h-4 w-4" />}
                  label="GPS Lon"
                  value={telemetry.gpsLon.toFixed(6)}
                  unit="°E"
                  color="text-emerald-400"
                />
              </div>
              <div className="mt-4 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-slate-400" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-slate-500">Fog Visibility Estimate</span>
                      <span className="font-mono text-sm font-bold text-slate-200">{telemetry.fogVisibility.toFixed(1)} m</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          telemetry.fogVisibility < 3.5 ? 'bg-red-500' :
                          telemetry.fogVisibility < 4 ? 'bg-orange-500' :
                          telemetry.fogVisibility < 4.5 ? 'bg-yellow-500' :
                          'bg-emerald-500'
                        }`}
                        style={{ width: `${(telemetry.fogVisibility / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
              <Zap className="h-4 w-4 text-amber-500" />
              Simulation Controls
            </h2>
            <div className="space-y-3">
              <button
                onClick={onTriggerApproach}
                disabled={state.approaching}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-sm font-bold text-slate-950 transition hover:shadow-lg hover:shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Car className="h-4 w-4" />
                {state.approaching ? 'Vehicle Approaching...' : 'Simulate Approaching Vehicle'}
              </button>
              <button
                onClick={onReset}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
              >
                <RotateCcw className="h-4 w-4" />
                Reset to Safe Distance
              </button>
              <div className="pt-2">
                <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">Simulation Speed</p>
                <div className="flex gap-2">
                  {[1, 2, 4].map((s) => (
                    <button
                      key={s}
                      onClick={() => onSetSimSpeed(s)}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition ${
                        state.simSpeed === s
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collision Visualizer */}
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
            <TrendingDown className="h-4 w-4 text-amber-500" />
            Collision Avoidance Visualizer
          </h2>
          <div className="relative h-40 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 grid-bg">
            {/* Own vehicle */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="flex h-12 w-20 items-center justify-center rounded-md bg-amber-500/20 border-2 border-amber-500">
                <Car className="h-6 w-6 text-amber-400" />
              </div>
              <p className="mt-1 text-center text-[10px] font-mono text-amber-400">DMP-014 (YOU)</p>
            </div>
            {/* Approaching vehicle */}
            <div
              className="absolute transition-all duration-1000 ease-linear"
              style={{
                bottom: `${Math.min(85, 20 + (distance / 150) * 65)}%`,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <div className={`flex h-10 w-16 items-center justify-center rounded-md border-2 ${colors.border} ${colors.bg}`}>
                <Car className={`h-5 w-5 ${colors.text}`} />
              </div>
              <p className={`mt-1 text-center text-[10px] font-mono ${colors.text}`}>{distance.toFixed(1)}m</p>
            </div>
            {/* Scan line */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-scan" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SensorCard({
  icon, label, value, sub, color,
}: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700">
      <div className="mb-2 flex items-center gap-2">
        <span className={color}>{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <p className={`font-mono text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-600">{sub}</p>
    </div>
  );
}

function TelemetryItem({
  icon, label, value, unit, color,
}: { icon: React.ReactNode; label: string; value: string; unit: string; color: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <div className="mb-1 flex items-center gap-1.5 text-slate-500">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-lg font-bold ${color}`}>{value}</span>
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
    </div>
  );
}
