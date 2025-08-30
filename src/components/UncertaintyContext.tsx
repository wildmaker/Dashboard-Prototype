import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type DistributionType = 'uniform' | 'normal' | 'triangular';

export interface UncertaintyParam {
  value: number | null;
  unit: string;
  distribution: DistributionType;
}

export interface UncertaintyParams {
  sensorError: UncertaintyParam;
  standardError: UncertaintyParam;
  environmentError: UncertaintyParam;
  radialMisalignment: UncertaintyParam;
  axialMisalignment: UncertaintyParam;
}

export interface UncertaintyResults {
  radial: number | null; // μm
  axial: number | null; // μm
  valid: boolean;
}

export type UncertaintyStatus = 'empty' | 'filled' | 'stale';

export interface UncertaintyState {
  status: UncertaintyStatus;
  lastUpdated: string | null; // ISO string
  params: UncertaintyParams;
  results: UncertaintyResults;
}

interface UncertaintyContextType {
  state: UncertaintyState;
  setParams: (updater: (prev: UncertaintyParams) => UncertaintyParams) => void;
  save: () => void;
  resetToDefaults: () => void;
  markStale: () => void;
  openDialog: () => void;
  closeDialog: () => void;
  isDialogOpen: boolean;
  // Per-report binding
  currentKey: string | null;
  setAssessmentKey: (key: string | null) => void;
  // Defaults management
  defaults: { params: UncertaintyParams; lastModified: string | null };
  loadDefaultsIntoParams: () => void;
  updateDefaults: (updater: (prev: UncertaintyParams) => UncertaintyParams) => void;
  saveDefaults: () => void;
  resetDefaults: () => void;
  exportDefaults: () => string; // JSON string
  importDefaults: (json: string) => boolean;
}

export const DEFAULT_PARAMS: UncertaintyParams = {
  sensorError: { value: 0.5, unit: 'μm', distribution: 'uniform' },
  standardError: { value: 0.3, unit: 'μm', distribution: 'uniform' },
  environmentError: { value: 0.2, unit: 'μm', distribution: 'uniform' },
  radialMisalignment: { value: 0.4, unit: 'μm', distribution: 'uniform' },
  axialMisalignment: { value: 0.4, unit: 'μm', distribution: 'uniform' },
};

const STORAGE_KEY = 'uncertainty.state.v1';
const MAP_STORAGE_KEY = 'uncertainty.state.map.v1';
const DEFAULTS_STORAGE_KEY = 'uncertainty.defaults.v1';

function calcStdFromParam(param: UncertaintyParam): number | null {
  if (param.value === null || isNaN(param.value)) return null;
  const a = Math.abs(param.value);
  if (param.distribution === 'uniform') return a / Math.sqrt(3);
  if (param.distribution === 'triangular') return a / Math.sqrt(6);
  return a; // normal: treat value as standard deviation
}

function computeResults(params: UncertaintyParams): UncertaintyResults {
  const stds = {
    sensor: calcStdFromParam(params.sensorError),
    standard: calcStdFromParam(params.standardError),
    env: calcStdFromParam(params.environmentError),
    radial: calcStdFromParam(params.radialMisalignment),
    axial: calcStdFromParam(params.axialMisalignment),
  };

  const anyNull = Object.values(stds).some((v) => v === null);
  if (anyNull) return { radial: null, axial: null, valid: false };

  const rss = (...vals: number[]) => Math.sqrt(vals.reduce((s, v) => s + v * v, 0));
  const radial = rss(stds.sensor!, stds.standard!, stds.env!, stds.radial!);
  const axial = rss(stds.sensor!, stds.standard!, stds.env!, stds.axial!);
  return { radial: Number(radial.toFixed(3)), axial: Number(axial.toFixed(3)), valid: true };
}

const UncertaintyContext = createContext<UncertaintyContextType | undefined>(undefined);

export function UncertaintyProvider({ children }: { children?: React.ReactNode }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [stateMap, setStateMap] = useState<Record<string, UncertaintyState>>({});
  const [defaults, setDefaults] = useState<{ params: UncertaintyParams; lastModified: string | null }>({ params: DEFAULT_PARAMS, lastModified: null });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const rawDefaults = localStorage.getItem(DEFAULTS_STORAGE_KEY);
      const rawMap = localStorage.getItem(MAP_STORAGE_KEY);
      if (rawDefaults) {
        try {
          const parsedDefaults = JSON.parse(rawDefaults) as { params: UncertaintyParams; lastModified: string | null };
          if (parsedDefaults && parsedDefaults.params) {
            setDefaults(parsedDefaults);
          }
        } catch {}
      }
      if (rawMap) {
        try {
          const parsedMap = JSON.parse(rawMap) as Record<string, UncertaintyState>;
          if (parsedMap && typeof parsedMap === 'object') {
            setStateMap(parsedMap);
          }
        } catch {}
      }
      // Backward-compat: migrate legacy single state into a generic key
      if (raw) {
        try {
          const legacy = JSON.parse(raw) as UncertaintyState;
          if (legacy && legacy.params) {
            setStateMap((prev) => ({ ...prev, __legacy__: legacy }));
          }
        } catch {}
      }
    } catch {}
  }, []);

  const ensureKey = (key: string) => {
    if (!stateMap[key]) {
      const initialParams = defaults.params || DEFAULT_PARAMS;
      const initial: UncertaintyState = {
        status: 'empty',
        lastUpdated: null,
        params: initialParams,
        results: computeResults(initialParams),
      };
      setStateMap((prev) => ({ ...prev, [key]: initial }));
      try { localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify({ ...stateMap, [key]: initial })); } catch {}
    }
  };

  const activeKey = currentKey ?? '__legacy__';
  const activeEntry = stateMap[activeKey] || { status: 'empty' as UncertaintyStatus, lastUpdated: null, params: defaults.params, results: computeResults(defaults.params) };

  const results = useMemo(() => computeResults(activeEntry.params), [activeEntry.params]);

  const state: UncertaintyState = useMemo(
    () => ({ status: activeEntry.status, lastUpdated: activeEntry.lastUpdated, params: activeEntry.params, results }),
    [activeEntry.status, activeEntry.lastUpdated, activeEntry.params, results]
  );

  const persistMap = (nextMap: Record<string, UncertaintyState>) => {
    try { localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(nextMap)); } catch {}
  };

  const setParams = (updater: (prev: UncertaintyParams) => UncertaintyParams) => {
    const key = activeKey;
    ensureKey(key);
    setStateMap((prev) => {
      const current = prev[key] || activeEntry;
      const nextParams = updater(current.params);
      const nextState: UncertaintyState = {
        ...current,
        status: current.status === 'filled' ? 'stale' : current.status,
        params: nextParams,
        results: computeResults(nextParams),
      };
      const nextMap = { ...prev, [key]: nextState };
      persistMap(nextMap);
      return nextMap;
    });
  };

  const save = () => {
    const key = activeKey;
    ensureKey(key);
    const now = new Date().toISOString();
    setStateMap((prev) => {
      const current = prev[key] || activeEntry;
      const computed = computeResults(current.params);
      const next: UncertaintyState = {
        status: computed.valid ? 'filled' : 'empty',
        lastUpdated: computed.valid ? now : null,
        params: current.params,
        results: computed,
      };
      const nextMap = { ...prev, [key]: next };
      persistMap(nextMap);
      return nextMap;
    });
  };

  const resetToDefaults = () => {
    const key = activeKey;
    ensureKey(key);
    setStateMap((prev) => {
      const nextState: UncertaintyState = { status: 'empty', lastUpdated: null, params: DEFAULT_PARAMS, results: computeResults(DEFAULT_PARAMS) };
      const nextMap = { ...prev, [key]: nextState };
      persistMap(nextMap);
      return nextMap;
    });
  };

  const markStale = () => {
    const key = activeKey;
    setStateMap((prev) => {
      const current = prev[key] || activeEntry;
      if (current.status !== 'filled') return prev;
      const nextState: UncertaintyState = { ...current, status: 'stale' };
      const nextMap = { ...prev, [key]: nextState };
      persistMap(nextMap);
      return nextMap;
    });
  };

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const setAssessmentKey = (key: string | null) => {
    setCurrentKey(key);
    if (key) ensureKey(key);
  };

  // Defaults helpers
  const loadDefaultsIntoParams = () => {
    setParamsState(() => {
      const next = defaults.params || DEFAULT_PARAMS;
      if (status === 'filled') setStatus('stale');
      return next;
    });
  };

  const updateDefaults = (updater: (prev: UncertaintyParams) => UncertaintyParams) => {
    setDefaults((prev) => ({ ...prev, params: updater(prev.params) }));
  };

  const saveDefaults = () => {
    const now = new Date().toISOString();
    const next = { params: defaults.params, lastModified: now };
    setDefaults(next);
    try { localStorage.setItem(DEFAULTS_STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const resetDefaults = () => {
    const next = { params: DEFAULT_PARAMS, lastModified: null };
    setDefaults(next);
    try { localStorage.setItem(DEFAULTS_STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const exportDefaults = () => {
    try {
      return JSON.stringify({ params: defaults.params, lastModified: defaults.lastModified }, null, 2);
    } catch {
      return '';
    }
  };

  const importDefaults = (json: string) => {
    try {
      const parsed = JSON.parse(json) as { params: UncertaintyParams; lastModified?: string | null };
      if (!parsed || !parsed.params) return false;
      const next = { params: parsed.params, lastModified: parsed.lastModified ?? new Date().toISOString() };
      setDefaults(next);
      try { localStorage.setItem(DEFAULTS_STORAGE_KEY, JSON.stringify(next)); } catch {}
      return true;
    } catch {
      return false;
    }
  };

  const value: UncertaintyContextType = {
    state,
    setParams,
    save,
    resetToDefaults,
    markStale,
    openDialog,
    closeDialog,
    isDialogOpen,
    currentKey,
    setAssessmentKey,
    defaults,
    loadDefaultsIntoParams,
    updateDefaults,
    saveDefaults,
    resetDefaults,
    exportDefaults,
    importDefaults,
  };

  return <UncertaintyContext.Provider value={value}>{children}</UncertaintyContext.Provider>;
}

export function useUncertainty() {
  const ctx = useContext(UncertaintyContext);
  if (!ctx) throw new Error('useUncertainty must be used within UncertaintyProvider');
  return ctx;
}


