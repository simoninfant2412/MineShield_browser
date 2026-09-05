export type AlertLevel = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';

export type ViewMode = 'hud' | 'control';

export interface SensorMetrics {
  thermalLWIR: number;
  radar77GHz: number;
  lidar: number;
  dgpsRtkFix: 'FIX' | 'FLOAT' | 'SINGLE' | 'NONE';
}

export interface TelemetryData {
  speed: number;
  heading: number;
  gpsLat: number;
  gpsLon: number;
  fogVisibility: number;
}

export interface Dumper {
  id: string;
  status: 'ACTIVE' | 'IDLE' | 'MAINTENANCE' | 'EMERGENCY';
  speed: number;
  lat: number;
  lon: number;
  heading: number;
  alertLevel: AlertLevel;
  driver: string;
  payload: number;
  sensorHealth: number;
  lastUpdate: string;
}

export interface TelemetryLogEntry {
  id: number;
  timestamp: string;
  topic: string;
  payload: Record<string, unknown>;
}

export interface RoadSegment {
  id: string;
  name: string;
  visibility: number;
  segmentStart: { lat: number; lon: number };
  segmentEnd: { lat: number; lon: number };
  hazardLevel: 'CLEAR' | 'LOW_VIS' | 'HAZARDOUS';
}

export const ALERT_COLORS: Record<AlertLevel, {
  border: string;
  bg: string;
  text: string;
  badge: string;
  glow: string;
  hex: string;
}> = {
  NORMAL: {
    border: 'border-emerald-500',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500 text-slate-950',
    glow: 'glow-green',
    hex: '#22c55e',
  },
  WARNING: {
    border: 'border-yellow-500',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    badge: 'bg-yellow-500 text-slate-950',
    glow: 'glow-yellow',
    hex: '#eab308',
  },
  CRITICAL: {
    border: 'border-orange-500',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    badge: 'bg-orange-500 text-slate-950',
    glow: 'glow-orange',
    hex: '#f97316',
  },
  EMERGENCY: {
    border: 'border-red-500',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    badge: 'bg-red-500 text-white',
    glow: 'glow-red',
    hex: '#ef4444',
  },
};

export function distanceToAlertLevel(distance: number): AlertLevel {
  if (distance < 5) return 'EMERGENCY';
  if (distance < 15) return 'CRITICAL';
  if (distance <= 30) return 'WARNING';
  return 'NORMAL';
}
