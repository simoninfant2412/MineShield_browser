import { useEffect, useRef, useState, useCallback } from 'react';
import type {
  Dumper,
  TelemetryData,
  SensorMetrics,
  AlertLevel,
  TelemetryLogEntry,
  RoadSegment,
} from '@/types';
import { distanceToAlertLevel } from '@/types';

const DRIVERS = [
  'R. Sharma', 'A. Patel', 'S. Kumar', 'V. Reddy', 'D. Singh',
  'M. Naidu', 'K. Rao', 'L. Verma',
];

const DUMPER_IDS = ['DMP-014', 'DMP-008', 'DMP-021', 'DMP-003', 'DMP-017'];

const BASE_LAT = 18.3056;
const BASE_LON = 81.0972;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function makeInitialDumpers(): Dumper[] {
  return DUMPER_IDS.map((id, i) => {
    const speed = randomBetween(0, 12);
    const distance = randomBetween(20, 120);
    return {
      id,
      status: i === 0 ? 'ACTIVE' : ['ACTIVE', 'IDLE', 'ACTIVE'][i % 3] as Dumper['status'],
      speed,
      lat: BASE_LAT + randomBetween(-0.01, 0.01),
      lon: BASE_LON + randomBetween(-0.01, 0.01),
      heading: Math.floor(randomBetween(0, 360)),
      alertLevel: distanceToAlertLevel(distance),
      driver: DRIVERS[i % DRIVERS.length],
      payload: Math.floor(randomBetween(0, 220)),
      sensorHealth: Math.floor(randomBetween(85, 100)),
      lastUpdate: new Date().toISOString(),
    };
  });
}

function makeRoadSegments(): RoadSegment[] {
  const segments: RoadSegment[] = [];
  for (let i = 0; i < 8; i++) {
    const vis = randomBetween(1, 12);
    segments.push({
      id: `SEG-${String(i + 1).padStart(3, '0')}`,
      name: `Haul Road ${String.fromCharCode(65 + i)}`,
      visibility: vis,
      segmentStart: { lat: BASE_LAT + randomBetween(-0.008, 0.008), lon: BASE_LON + randomBetween(-0.008, 0.008) },
      segmentEnd: { lat: BASE_LAT + randomBetween(-0.008, 0.008), lon: BASE_LON + randomBetween(-0.008, 0.008) },
      hazardLevel: vis < 3 ? 'HAZARDOUS' : vis < 5 ? 'LOW_VIS' : 'CLEAR',
    });
  }
  return segments;
}

export interface SimulationState {
  distance: number;
  alertLevel: AlertLevel;
  telemetry: TelemetryData;
  sensors: SensorMetrics;
  dumpers: Dumper[];
  roadSegments: RoadSegment[];
  log: TelemetryLogEntry[];
  approaching: boolean;
  simSpeed: number;
}

let logIdCounter = 0;

function generateLogEntry(dumperId: string, telemetry: Record<string, unknown>): TelemetryLogEntry {
  const topics = [
    `nmcd/fleet/${dumperId}/telemetry`,
    `nmcd/fleet/${dumperId}/sensors`,
    `nmcd/fleet/${dumperId}/safety`,
    `nmcd/fleet/${dumperId}/gps`,
  ];
  return {
    id: logIdCounter++,
    timestamp: new Date().toISOString(),
    topic: topics[Math.floor(Math.random() * topics.length)],
    payload: {
      dumper_id: dumperId,
      ts: Date.now(),
      ...telemetry,
      firmware: 'v2.4.1',
      site: 'NMDC-Bailadila',
    },
  };
}

export function useSimulation() {
  const [state, setState] = useState<SimulationState>(() => {
    const dumpers = makeInitialDumpers();
    return {
      distance: 85,
      alertLevel: 'NORMAL',
      telemetry: {
        speed: 8.2,
        heading: 45,
        gpsLat: BASE_LAT,
        gpsLon: BASE_LON,
        fogVisibility: 4.2,
      },
      sensors: {
        thermalLWIR: 24.5,
        radar77GHz: 85,
        lidar: 82,
        dgpsRtkFix: 'FIX',
      },
      dumpers,
      roadSegments: makeRoadSegments(),
      log: [],
      approaching: false,
      simSpeed: 1,
    };
  });

  const approachingRef = useRef(false);
  const distanceRef = useRef(85);
  const simSpeedRef = useRef(1);

  useEffect(() => {
    approachingRef.current = state.approaching;
    distanceRef.current = state.distance;
    simSpeedRef.current = state.simSpeed;
  });

  const triggerApproach = useCallback(() => {
    setState((prev) => ({ ...prev, approaching: true, distance: 80 }));
    approachingRef.current = true;
    distanceRef.current = 80;
  }, []);

  const resetSimulation = useCallback(() => {
    setState((prev) => ({ ...prev, approaching: false, distance: 85 }));
    approachingRef.current = false;
    distanceRef.current = 85;
  }, []);

  const setSimSpeed = useCallback((speed: number) => {
    setState((prev) => ({ ...prev, simSpeed: speed }));
    simSpeedRef.current = speed;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const speed = simSpeedRef.current;

      // Distance logic
      let dist = distanceRef.current;
      if (approachingRef.current) {
        dist -= randomBetween(0.8, 2.5) * speed;
        if (dist < 1.5) dist = 1.5;
      } else {
        dist += randomBetween(-1, 1.5) * speed;
        dist = Math.max(10, Math.min(150, dist));
      }

      const alert = distanceToAlertLevel(dist);

      // Telemetry
      const newSpeed = Math.max(0, 8.2 + randomBetween(-1.5, 1.5));
      const newHeading = Math.floor((45 + randomBetween(-15, 15) + 360) % 360);
      const newLat = BASE_LAT + randomBetween(-0.005, 0.005);
      const newLon = BASE_LON + randomBetween(-0.005, 0.005);
      const newFog = randomBetween(3, 5);

      // Sensors
      const thermal = 24.5 + randomBetween(-2, 3);
      const radar = Math.max(0, dist + randomBetween(-3, 3));
      const lidarReading = Math.max(0, dist + randomBetween(-2, 2));
      const fixTypes: SensorMetrics['dgpsRtkFix'][] = ['FIX', 'FIX', 'FIX', 'FLOAT', 'SINGLE'];
      const fix = fixTypes[Math.floor(Math.random() * fixTypes.length)];

      // Dumpers
      const dumpers = state.dumpers.map((d, i) => {
        const dSpeed = Math.max(0, d.speed + randomBetween(-1.5, 1.5));
        const dDistance = randomBetween(8, 130);
        return {
          ...d,
          speed: dSpeed,
          lat: d.lat + randomBetween(-0.0005, 0.0005),
          lon: d.lon + randomBetween(-0.0005, 0.0005),
          heading: Math.floor((d.heading + randomBetween(-10, 10) + 360) % 360),
          alertLevel: i === 0 ? alert : distanceToAlertLevel(dDistance),
          sensorHealth: Math.min(100, Math.max(70, d.sensorHealth + Math.floor(randomBetween(-1, 1.5)))),
          lastUpdate: new Date().toISOString(),
          status: (i === 0 && alert === 'EMERGENCY') ? 'EMERGENCY' as Dumper['status'] : d.status === 'EMERGENCY' ? 'ACTIVE' as Dumper['status'] : d.status,
        };
      });

      // Road segments
      const roadSegments = state.roadSegments.map((seg) => {
        const vis = Math.max(0.5, seg.visibility + randomBetween(-0.5, 0.5));
        return {
          ...seg,
          visibility: vis,
          hazardLevel: vis < 3 ? 'HAZARDOUS' as const : vis < 5 ? 'LOW_VIS' as const : 'CLEAR' as const,
        };
      });

      // Log entries
      const newLogs: TelemetryLogEntry[] = [];
      if (Math.random() > 0.3) {
        const targetDumper = dumpers[Math.floor(Math.random() * dumpers.length)];
        newLogs.push(generateLogEntry(targetDumper.id, {
          speed: parseFloat(newSpeed.toFixed(2)),
          heading: newHeading,
          lat: parseFloat(newLat.toFixed(6)),
          lon: parseFloat(newLon.toFixed(6)),
          alert_level: alert,
          distance: parseFloat(dist.toFixed(2)),
        }));
      }

      setState((prev) => ({
        ...prev,
        distance: dist,
        alertLevel: alert,
        telemetry: {
          speed: newSpeed,
          heading: newHeading,
          gpsLat: newLat,
          gpsLon: newLon,
          fogVisibility: newFog,
        },
        sensors: {
          thermalLWIR: thermal,
          radar77GHz: radar,
          lidar: lidarReading,
          dgpsRtkFix: fix,
        },
        dumpers,
        roadSegments,
        log: [...newLogs, ...prev.log].slice(0, 50),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    state,
    triggerApproach,
    resetSimulation,
    setSimSpeed,
  };
}
