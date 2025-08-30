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
  const [params, setParamsState] = useState<UncertaintyParams>(DEFAULT_PARAMS);
  const [status, setStatus] = useState<UncertaintyStatus>('empty');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [defaults, setDefaults] = useState<{ params: UncertaintyParams; lastModified: string | null }>({ params: DEFAULT_PARAMS, lastModified: null });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const rawDefaults = localStorage.getItem(DEFAULTS_STORAGE_KEY);
      if (rawDefaults) {
        try {
          const parsedDefaults = JSON.parse(rawDefaults) as { params: UncertaintyParams; lastModified: string | null };
          if (parsedDefaults && parsedDefaults.params) {
            setDefaults(parsedDefaults);
          }
        } catch {}
      }
      if (raw) {
        const parsed = JSON.parse(raw) as UncertaintyState;
        if (parsed && parsed.params) {
          setParamsState(parsed.params);
          setStatus(parsed.status);
          setLastUpdated(parsed.lastUpdated);
        }
      } else {
        // If no current state persisted, initialize params from defaults if available
        setParamsState((prev) => defaults.params || prev);
      }
    } catch {}
  }, []);

  const results = useMemo(() => computeResults(params), [params]);

  const state: UncertaintyState = useMemo(
    () => ({ status, lastUpdated, params, results }),
    [status, lastUpdated, params, results]
  );

  const persist = (next: UncertaintyState) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const setParams = (updater: (prev: UncertaintyParams) => UncertaintyParams) => {
    setParamsState((prev) => {
      const next = updater(prev);
      if (status === 'filled') setStatus('stale');
      return next;
    });
  };

  const save = () => {
    const now = new Date().toISOString();
    const next: UncertaintyState = {
      status: results.valid ? 'filled' : 'empty',
      lastUpdated: results.valid ? now : null,
      params,
      results,
    };
    setStatus(next.status);
    setLastUpdated(next.lastUpdated);
    persist(next);
  };

  const resetToDefaults = () => {
    setParamsState(DEFAULT_PARAMS);
    setStatus('empty');
    setLastUpdated(null);
    persist({ status: 'empty', lastUpdated: null, params: DEFAULT_PARAMS, results: computeResults(DEFAULT_PARAMS) });
  };

  const markStale = () => {
    if (status === 'filled') setStatus('stale');
  };

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

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


