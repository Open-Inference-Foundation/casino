/**
 * useActiveBuild — localStorage persistence for active build/edit markers (P0-30).
 *
 * Persists a marker when a build or edit starts so the UI can recover if the
 * SSE stream drops (navigate away, tab close, network flap, laptop sleep).
 * On mount, detects orphaned builds from previous sessions and exposes them
 * for recovery polling in Workspace.tsx.
 */

import { useState, useEffect, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

export type StreamStatus = 'connected' | 'reconnecting' | 'polling' | 'recovered' | 'disconnected';

export interface ActiveBuildMarker {
  workspaceId: string;
  siteId: string | null;
  phase: 'building' | 'editing';
  startedAt: number;        // epoch ms
  sessionId: string | null;
  toolName: string;          // 'build_site' | 'edit_site' | 'build_static_site'
}

export interface UseActiveBuildReturn {
  markBuildStarted: (marker: Omit<ActiveBuildMarker, 'startedAt'>) => void;
  markBuildEnded: () => void;
  orphanedBuild: ActiveBuildMarker | null;
  dismissOrphan: () => void;
  streamStatus: StreamStatus;
  setStreamStatus: (status: StreamStatus) => void;
  recoveryMessage: string | null;
  setRecoveryMessage: (msg: string | null) => void;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const STORAGE_PREFIX = 'casino:active_build:';
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes
const MAX_ENTRIES = 20;

function storageKey(tenantId?: string, userId?: string, workspaceId?: string): string {
  return `${STORAGE_PREFIX}${tenantId || 'default'}:${userId || 'anon'}:${workspaceId || 'none'}`;
}

// ─── Safe localStorage helpers ──────────────────────────────────────────────

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch { /* quota or disabled — swallow */ }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch { /* swallow */ }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useActiveBuild(
  tenantId?: string,
  userId?: string,
  workspaceId?: string,
): UseActiveBuildReturn {
  const [orphanedBuild, setOrphanedBuild] = useState<ActiveBuildMarker | null>(null);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('connected');
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);

  const key = storageKey(tenantId, userId, workspaceId);

  // ── Mount: hydrate orphaned build from localStorage ─────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = safeGetItem(key);
    if (!raw) return;

    try {
      const marker: ActiveBuildMarker = JSON.parse(raw);
      const age = Date.now() - marker.startedAt;
      if (age < MAX_AGE_MS) {
        setOrphanedBuild(marker);
      } else {
        // Stale — clean up
        safeRemoveItem(key);
      }
    } catch {
      safeRemoveItem(key);
    }
  }, [key]);

  // ── Mount: sweep stale entries across all workspaces ────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const allKeys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
      const now = Date.now();
      const entries: Array<{ key: string; startedAt: number }> = [];

      for (const k of allKeys) {
        try {
          const v = JSON.parse(localStorage.getItem(k) || '{}');
          const age = now - (v.startedAt || 0);
          if (age > MAX_AGE_MS) {
            safeRemoveItem(k);
          } else {
            entries.push({ key: k, startedAt: v.startedAt || 0 });
          }
        } catch {
          safeRemoveItem(k);
        }
      }

      // Cap at MAX_ENTRIES — remove oldest
      if (entries.length > MAX_ENTRIES) {
        entries.sort((a, b) => a.startedAt - b.startedAt);
        for (let i = 0; i < entries.length - MAX_ENTRIES; i++) {
          safeRemoveItem(entries[i].key);
        }
      }
    } catch { /* best effort */ }
  }, []);

  // ── API ─────────────────────────────────────────────────────────────────

  const markBuildStarted = useCallback((marker: Omit<ActiveBuildMarker, 'startedAt'>) => {
    const full: ActiveBuildMarker = { ...marker, startedAt: Date.now() };
    safeSetItem(key, JSON.stringify(full));
    // Clear any orphan state — this is a fresh build
    setOrphanedBuild(null);
  }, [key]);

  const markBuildEnded = useCallback(() => {
    safeRemoveItem(key);
    setOrphanedBuild(null);
  }, [key]);

  const dismissOrphan = useCallback(() => {
    safeRemoveItem(key);
    setOrphanedBuild(null);
    setRecoveryMessage(null);
    setStreamStatus('connected');
  }, [key]);

  return {
    markBuildStarted,
    markBuildEnded,
    orphanedBuild,
    dismissOrphan,
    streamStatus,
    setStreamStatus,
    recoveryMessage,
    setRecoveryMessage,
  };
}
