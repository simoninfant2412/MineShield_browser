import {
  Truck, AlertTriangle, Gauge, Activity, Database,
  Eye, MapPin, Radio, Cpu, ChevronRight, Wifi,
} from 'lucide-react';
import type { SimulationState } from '@/hooks/useSimulation';
import type { Dumper, AlertLevel } from '@/types';
import { ALERT_COLORS } from '@/types';

interface ControlRoomProps {
  state: SimulationState;
}

export function ControlRoom({ state }: ControlRoomProps) {
  const { dumpers, log, roadSegments } = state;

  const activeDumpers = dumpers.filter((d) => d.status === 'ACTIVE' || d.status === 'EMERGENCY').length;
  const activeWarnings = dumpers.filter((d) => d.alertLevel !== 'NORMAL').length;
  const avgSpeed = dumpers.reduce((sum, d) => sum + d.speed, 0) / dumpers.length;
  const avgSensorHealth = dumpers.reduce((sum, d) => sum + d.sensorHealth, 0) / dumpers.length;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950">
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        {/* Stat Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<Truck className="h-5 w-5" />}
            label="Total Active Dumpers"
            value={activeDumpers.toString()}
            sub={`of ${dumpers.length} fleet`}
            color="text-cyan-400"
            bg="bg-cyan-500/10"
            border="border-cyan-500/30"
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Active Safety Warnings"
            value={activeWarnings.toString()}
            sub={activeWarnings > 0 ? 'Requires attention' : 'All clear'}
            color={activeWarnings > 0 ? 'text-orange-400' : 'text-emerald-400'}
            bg={activeWarnings > 0 ? 'bg-orange-500/10' : 'bg-emerald-500/10'}
            border={activeWarnings > 0 ? 'border-orange-500/30' : 'border-emerald-500/30'}
          />
          <StatCard
            icon={<Gauge className="h-5 w-5" />}
            label="Average Fleet Speed"
            value={`${avgSpeed.toFixed(1)} m/s`}
            sub={`${(avgSpeed * 3.6).toFixed(1)} km/h`}
            color="text-amber-400"
            bg="bg-amber-500/10"
            border="border-amber-500/30"
          />
          <StatCard
            icon={<Cpu className="h-5 w-5" />}
            label="Sensor Health Status"
            value={`${avgSensorHealth.toFixed(0)}%`}
            sub={avgSensorHealth >= 95 ? 'Optimal' : avgSensorHealth >= 85 ? 'Good' : 'Check needed'}
            color={avgSensorHealth >= 95 ? 'text-emerald-400' : avgSensorHealth >= 85 ? 'text-yellow-400' : 'text-red-400'}
            bg={avgSensorHealth >= 95 ? 'bg-emerald-500/10' : avgSensorHealth >= 85 ? 'bg-yellow-500/10' : 'bg-red-500/10'}
            border={avgSensorHealth >= 95 ? 'border-emerald-500/30' : avgSensorHealth >= 85 ? 'border-yellow-500/30' : 'border-red-500/30'}
          />
        </div>

        {/* Main Grid */}
        <div className="grid gap-4 xl:grid-cols-3">
          {/* Fleet Table */}
          <div className="xl:col-span-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
              <div className="flex items-center justify-between border-b border-slate-800 p-4">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
                  <Truck className="h-4 w-4 text-cyan-400" />
                  Mine Fleet Overview
                </h2>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
                  REAL-TIME
                </span>
              </div>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-3 font-semibold">Dumper ID</th>
                      <th className="px-4 py-3 font-semibold">Driver</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Speed</th>
                      <th className="px-4 py-3 font-semibold">Coordinates</th>
                      <th className="px-4 py-3 font-semibold">Alert</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dumpers.map((dumper) => (
                      <FleetRow key={dumper.id} dumper={dumper} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Telemetry Log */}
          <div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
              <div className="flex items-center justify-between border-b border-slate-800 p-4">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
                  <Database className="h-4 w-4 text-emerald-400" />
                  Telemetry Stream
                </h2>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Wifi className="h-3 w-3 text-emerald-400" />
                  MQTT
                </span>
              </div>
              <div className="h-[500px] overflow-y-auto scrollbar-thin p-3 font-mono text-xs">
                {log.length === 0 && (
                  <div className="flex h-full items-center justify-center text-slate-600">
                    <div className="text-center">
                      <Radio className="mx-auto mb-2 h-6 w-6 animate-pulse" />
                      <p>Waiting for telemetry...</p>
                    </div>
                  </div>
                )}
                {log.map((entry) => (
                  <div key={entry.id} className="mb-2 rounded-lg border border-slate-800 bg-slate-950/50 p-3 animate-slide-in">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400">{entry.topic}</span>
                      <span className="text-slate-600">{entry.timestamp.split('T')[1]?.split('.')[0]}</span>
                    </div>
                    <pre className="mt-2 overflow-x-auto text-slate-400">
                      {JSON.stringify(entry.payload, null, 0)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Visibility Heatmap */}
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
            <Eye className="h-4 w-4 text-amber-400" />
            Visibility Heatmap Simulator
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {roadSegments.map((seg) => {
              const isHazardous = seg.hazardLevel === 'HAZARDOUS';
              const isLowVis = seg.hazardLevel === 'LOW_VIS';
              const color = isHazardous ? 'border-red-500/50 bg-red-500/10' :
                          isLowVis ? 'border-yellow-500/50 bg-yellow-500/10' :
                          'border-emerald-500/30 bg-emerald-500/5';
              const visColor = isHazardous ? 'text-red-400' :
                             isLowVis ? 'text-yellow-400' :
                             'text-emerald-400';
              return (
                <div key={seg.id} className={`rounded-xl border p-4 transition ${color}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{seg.name}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      isHazardous ? 'bg-red-500 text-white' :
                      isLowVis ? 'bg-yellow-500 text-slate-950' :
                      'bg-emerald-500 text-slate-950'
                    }`}>
                      {seg.hazardLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className={`h-4 w-4 ${visColor}`} />
                    <span className={`font-mono text-lg font-bold ${visColor}`}>
                      {seg.visibility.toFixed(1)} m
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
                    <MapPin className="h-3 w-3" />
                    <span className="font-mono">
                      {seg.segmentStart.lat.toFixed(4)}, {seg.segmentStart.lon.toFixed(4)}
                    </span>
                  </div>
                  {isHazardous && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-red-400">
                      <AlertTriangle className="h-3 w-3 animate-pulse" />
                      Fog hazard — reroute recommended
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, sub, color, bg, border,
}: {
  icon: React.ReactNode; label: string; value: string; sub: string;
  color: string; bg: string; border: string;
}) {
  return (
    <div className={`rounded-2xl border ${border} ${bg} p-4 transition hover:scale-[1.02]`}>
      <div className="mb-2 flex items-center gap-2">
        <span className={color}>{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <p className={`font-mono text-2xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}

function FleetRow({ dumper }: { dumper: Dumper }) {
  const colors = ALERT_COLORS[dumper.alertLevel as AlertLevel];
  const statusColor =
    dumper.status === 'EMERGENCY' ? 'text-red-400 bg-red-500/10' :
    dumper.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/10' :
    dumper.status === 'IDLE' ? 'text-slate-400 bg-slate-500/10' :
    'text-yellow-400 bg-yellow-500/10';

  return (
    <tr className="border-b border-slate-800/50 transition hover:bg-slate-800/30">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className="font-mono font-bold text-slate-200">{dumper.id}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-400">{dumper.driver}</td>
      <td className="px-4 py-3">
        <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${statusColor}`}>
          {dumper.status}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-slate-300">
        {dumper.speed.toFixed(1)} <span className="text-slate-600">m/s</span>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-slate-400">
        {dumper.lat.toFixed(4)}, {dumper.lon.toFixed(4)}
      </td>
      <td className="px-4 py-3">
        <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${colors.badge}`}>
          {dumper.alertLevel}
        </span>
      </td>
    </tr>
  );
}
