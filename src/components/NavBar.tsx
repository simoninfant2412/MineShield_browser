import { Radio, Monitor, Truck, Activity } from 'lucide-react';
import type { ViewMode } from '@/types';

interface NavBarProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  alertLevel: string;
}

export function NavBar({ view, onViewChange, alertLevel }: NavBarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto max-w-[1600px] px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
              <Radio className="h-5 w-5 text-slate-950" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-100 sm:text-base">
                NMDC Mine Dumper Safety
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500 sm:text-xs">
                Navigation & Collision Avoidance System
              </p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 p-1">
            <button
              onClick={() => onViewChange('hud')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
                view === 'hud'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Driver HUD</span>
              <span className="sm:hidden">HUD</span>
            </button>
            <button
              onClick={() => onViewChange('control')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
                view === 'control'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Control Room</span>
              <span className="sm:hidden">Control</span>
            </button>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2 text-xs">
            <Activity className={`h-4 w-4 ${
              alertLevel === 'EMERGENCY' ? 'text-red-500 animate-pulse' :
              alertLevel === 'CRITICAL' ? 'text-orange-500' :
              alertLevel === 'WARNING' ? 'text-yellow-500' :
              'text-emerald-500'
            }`} />
            <span className="font-mono text-slate-400">SYSTEM ONLINE</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
