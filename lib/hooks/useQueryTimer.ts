/**
 * Query runtime timer with localStorage persistence (P0-18).
 *
 * Default-on for every query that flows through useAgent. Tracks elapsed
 * time, auto-detects query category from tool calls, and collects an
 * activity event log for the collapsible timeline.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { type QueryCategory, CATEGORY_THRESHOLDS, promoteCategory } from '../query-category';
import { getActivityDescription } from '../activity-descriptions';

// ─── Types ──────────────────────────────────────────────────────────────────

export type TimerState = 'idle' | 'running' | 'paused' | 'complete' | 'failed' | 'cancelled';
export type TimerColor = 'green' | 'amber' | 'red';

export interface ActivityEvent {
  elapsedMs: number;
  label: string;
  kind: 'tool' | 'stage' | 'start' | 'end';
}

export interface QueryTimerState {
  /** Seconds since query started. */
  elapsed: number;
  /** Human-readable elapsed string (e.g., "2:47"). */
  elapsedDisplay: string;
  /** Epoch ms when the query started (persisted to localStorage). */
  startedAt: number | null;
  /** Timer lifecycle state. */
  state: TimerState;
  /** Auto-detected query category (upgrades as tools fire). */
  category: QueryCategory;
  /** Current color based on elapsed vs. category thresholds. */
  color: TimerColor;
  /** "Typical: 2-5 min" label for the current category. */
  typicalLabel: string;
  /** Current activity description (last tool that fired). */
  currentActivity: string;
  /** Sequential event log for the collapsible timeline. */
  events: ActivityEvent[];
  /** True when the timer has entered the red zone AND no SSE events in 30s. */
  isStuck: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function deriveColor(elapsed: number, category: QueryCategory): TimerColor {
  const t = CATEGORY_THRESHOLDS[category];
  if (elapsed >= t.red) return 'red';
  if (elapsed >= t.amber) return 'amber';
  return 'green';
}

const STORAGE_PREFIX = 'casino:query_timer:';

interface PersistedTimer {
  startedAt: number;
  category: QueryCategory;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useQueryTimer(
  /** True when the SSE stream is active. */
  isStreaming: boolean,
  /** Tool calls array from useAgent. */
  toolCalls: Array<{ name: string; status: string; startTime?: number }>,
  /** The current assistant message ID (unique per query). */
  queryId: string | null,
  /** P0-30: True during stream recovery — timer pauses instead of completing. */
  isPaused?: boolean,
): QueryTimerState {
  const [elapsed, setElapsed] = useState(0);
  const [state, setState] = useState<TimerState>('idle');
  const [category, setCategory] = useState<QueryCategory>('chat');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [currentActivity, setCurrentActivity] = useState('');
  const [lastEventTime, setLastEventTime] = useState(Date.now());

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seenToolsRef = useRef(new Set<string>());
  // Epoch ms when this timer started — used to ignore tool calls from earlier queries.
  // toolCalls in useAgent is session-scoped and persists across queries; without this
  // guard, old edit_site/build_site calls from earlier messages fire "Editing your site..."
  // the moment seenToolsRef is reset for a new query.
  const timerStartEpochRef = useRef<number>(0);
  // Debounce activity updates to max 1/sec
  const lastActivityUpdateRef = useRef(0);

  // ── Persist start time to localStorage ────────────────────────────────

  const storageKey = queryId ? `${STORAGE_PREFIX}${queryId}` : null;

  // Reset immediately when queryId changes — prevents the previous query's red/complete
  // state from bleeding onto the new message before streaming begins.
  const prevQueryIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (queryId === prevQueryIdRef.current) return;
    prevQueryIdRef.current = queryId;
    // Only reset if we're transitioning to a *new* non-null query ID
    if (queryId) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setState('idle');
      setElapsed(0);
      setEvents([]);
      setCurrentActivity('');
      setStartedAt(null);
      setCategory('chat');
      seenToolsRef.current = new Set();
    }
  }, [queryId]);

  // Start timer when streaming begins
  useEffect(() => {
    if (!isStreaming || !queryId) {
      return;
    }

    // Restore or create start time
    let start: number;
    let cat: QueryCategory = 'chat';
    const key = `${STORAGE_PREFIX}${queryId}`;

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed: PersistedTimer = JSON.parse(stored);
        start = parsed.startedAt;
        cat = parsed.category || 'chat';
      } else {
        start = Date.now();
        localStorage.setItem(key, JSON.stringify({ startedAt: start, category: cat }));
      }
    } catch {
      start = Date.now();
    }

    setStartedAt(start);
    setCategory(cat);
    setState('running');
    timerStartEpochRef.current = Date.now();
    setEvents([{ elapsedMs: 0, label: 'Query started', kind: 'start' }]);
    seenToolsRef.current = new Set();

    // Tick every second
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStreaming, queryId]);

  // ── Stop timer when streaming ends ────────────────────────────────────

  useEffect(() => {
    if (!isStreaming && state === 'running') {
      // P0-30: If in recovery mode, pause the timer instead of completing.
      // Timer keeps ticking so elapsed stays accurate, but we don't add
      // the "Done" event or transition to 'complete' until recovery resolves.
      if (isPaused) {
        setState('paused');
        return;
      }
      setState('complete');
      if (intervalRef.current) clearInterval(intervalRef.current);
      setEvents((prev) => [
        ...prev,
        { elapsedMs: elapsed * 1000, label: `Done in ${formatElapsed(elapsed)}`, kind: 'end' },
      ]);
    }
    // P0-30: Resume from paused → complete when recovery finishes
    if (!isPaused && state === 'paused') {
      setState('complete');
      if (intervalRef.current) clearInterval(intervalRef.current);
      setEvents((prev) => [
        ...prev,
        { elapsedMs: elapsed * 1000, label: `Done in ${formatElapsed(elapsed)}`, kind: 'end' },
      ]);
    }
  }, [isStreaming, state, elapsed, isPaused]);

  // ── Track tool calls for category promotion + activity log ────────────

  useEffect(() => {
    if (!isStreaming || toolCalls.length === 0) return;

    const now = Date.now();

    for (const tc of toolCalls) {
      // Skip tool calls that started before this timer's query began.
      // toolCalls is session-scoped in useAgent and includes ALL historical calls;
      // without this guard, old build_site/edit_site calls bleed into new queries.
      if (tc.startTime && tc.startTime < timerStartEpochRef.current) continue;

      // Only process each tool once
      const toolKey = `${tc.name}:${tc.status}`;
      if (seenToolsRef.current.has(toolKey)) continue;
      seenToolsRef.current.add(toolKey);

      // Promote category
      setCategory((prev) => {
        const next = promoteCategory(prev, tc.name);
        if (next !== prev && storageKey) {
          try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
              const parsed = JSON.parse(stored);
              parsed.category = next;
              localStorage.setItem(storageKey, JSON.stringify(parsed));
            }
          } catch { /* best effort */ }
        }
        return next;
      });

      // Add to activity log (running tools only, skip completed duplicates)
      if (tc.status === 'running') {
        const desc = getActivityDescription(tc.name);
        setEvents((prev) => [
          ...prev,
          { elapsedMs: elapsed * 1000, label: desc, kind: 'tool' },
        ]);

        // Debounce current activity updates to 1/sec
        if (now - lastActivityUpdateRef.current > 1000) {
          setCurrentActivity(desc);
          lastActivityUpdateRef.current = now;
        }
      }

      setLastEventTime(now);
    }
  }, [toolCalls, isStreaming, elapsed, storageKey]);

  // ── Stuck detection ───────────────────────────────────────────────────

  const color = useMemo(() => deriveColor(elapsed, category), [elapsed, category]);

  const isStuck = useMemo(() => {
    if (state !== 'running') return false;
    const t = CATEGORY_THRESHOLDS[category];
    const secsSinceLastEvent = (Date.now() - lastEventTime) / 1000;
    return elapsed >= t.red * 3 && secsSinceLastEvent >= 30;
  }, [state, elapsed, category, lastEventTime]);

  // ── Computed display values ───────────────────────────────────────────

  const elapsedDisplay = useMemo(() => formatElapsed(elapsed), [elapsed]);
  const typicalLabel = useMemo(
    () => `Typical: ${CATEGORY_THRESHOLDS[category].label}`,
    [category],
  );

  // ── Clean up old localStorage entries on mount (max 50 entries) ───────

  useEffect(() => {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX));
      if (keys.length > 50) {
        // Sort by stored startedAt, remove oldest
        const entries = keys
          .map((k) => {
            try {
              const v = JSON.parse(localStorage.getItem(k) || '{}');
              return { key: k, startedAt: v.startedAt || 0 };
            } catch {
              return { key: k, startedAt: 0 };
            }
          })
          .sort((a, b) => a.startedAt - b.startedAt);
        // Remove oldest half
        for (let i = 0; i < Math.floor(entries.length / 2); i++) {
          localStorage.removeItem(entries[i].key);
        }
      }
    } catch { /* best effort */ }
  }, []);

  return {
    elapsed,
    elapsedDisplay,
    startedAt,
    state,
    category,
    color,
    typicalLabel,
    currentActivity,
    events,
    isStuck,
  };
}
