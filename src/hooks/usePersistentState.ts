import { useState, useEffect, useCallback } from 'react';
import { AppState } from '../domain/types';
import { createInitialDemoState } from '../data/demoData';
import { sanitizeAppState } from '../utils/validation';

const STORAGE_KEY = 'paisapilot_state_v1';

export function usePersistentState() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return createInitialDemoState();
      }
      const parsed = JSON.parse(stored);
      return sanitizeAppState(parsed, createInitialDemoState());
    } catch (err) {
      console.warn('Failed to parse state from localStorage, falling back to demo state:', err);
      return createInitialDemoState();
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to persist state to localStorage:', err);
    }
  }, [state]);

  const resetToDemo = useCallback(() => {
    const demo = createInitialDemoState();
    setState(demo);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
    } catch (err) {
      console.error('Failed to reset demo state:', err);
    }
  }, []);

  const exportData = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `paisapilot-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [state]);

  const importData = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      const sanitized = sanitizeAppState(parsed, createInitialDemoState());
      setState(sanitized);
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  }, []);

  return {
    state,
    setState,
    resetToDemo,
    exportData,
    importData,
  };
}
