import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { WorkspacePhase } from './useWorkspaceState';

const DEFAULT_TITLE = 'Ca$ino Builder \u2014 Describe an app, get a live URL';
const FAVICON_DEFAULT = '/favicon.svg';
const FAVICON_BUILDING = '/favicon-building.svg';
const FAVICON_DONE = '/favicon-done.svg';
const PERMISSION_ASKED_KEY = 'casino:push_permission_asked';
const SOUND_ENABLED_KEY = 'casino:notification_sound';

// ---------------------------------------------------------------------------
// Favicon helper
// ---------------------------------------------------------------------------

function setFavicon(href: string) {
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]');
  if (link) link.href = href;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface BuildNotificationState {
  /** Whether the permission prompt should be shown */
  showPermissionPrompt: boolean;
  /** Dismiss the permission prompt (user said "No thanks") */
  dismissPrompt: () => void;
  /** Accept the permission prompt (user said "Notify me") */
  acceptPrompt: () => void;
}

export function useBuildNotification(
  phase: WorkspacePhase,
  appName: string | null,
  previewUrl: string | null,
): BuildNotificationState {
  const prevPhaseRef = useRef<WorkspacePhase>(phase);
  const errorTimestampRef = useRef<number>(0);
  const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // ------ Phase transition detection ------
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    // Skip if no actual transition
    if (prev === phase) return;

    const wasBuildOrEdit = prev === 'building' || prev === 'editing';

    // ── Building/editing started ──
    if (phase === 'building' || phase === 'editing') {
      document.title = 'Building\u2026 \u2014 Ca$ino Builder';
      setFavicon(FAVICON_BUILDING);

      // Phase 2: Prompt for notification permission after 10s of first build
      if (
        phase === 'building' &&
        typeof Notification !== 'undefined' &&
        Notification.permission === 'default' &&
        !localStorage.getItem(PERMISSION_ASKED_KEY)
      ) {
        promptTimerRef.current = setTimeout(() => {
          setShowPermissionPrompt(true);
        }, 10_000);
      }
      return;
    }

    // Cancel the permission prompt timer if build ended before 10s
    if (promptTimerRef.current) {
      clearTimeout(promptTimerRef.current);
      promptTimerRef.current = null;
    }

    // ── Build/edit completed ──
    if (phase === 'complete' && wasBuildOrEdit) {
      const name = appName || 'App';
      const isHidden = document.hidden;

      // Tab title
      document.title = isHidden
        ? `(1) Build ready \u2014 Ca$ino Builder`
        : `Build ready \u2014 Ca$ino Builder`;
      setFavicon(FAVICON_DONE);

      // Sound
      const soundEnabled = localStorage.getItem(SOUND_ENABLED_KEY) !== 'false';
      if (soundEnabled) {
        // Use a short Web Audio beep — no external mp3 needed
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.4);
        } catch {
          // AudioContext not available — skip sound
        }
      }

      // Browser notification (Phase 2) — only when tab is hidden
      if (
        isHidden &&
        typeof Notification !== 'undefined' &&
        Notification.permission === 'granted'
      ) {
        try {
          const n = new Notification('Build ready!', {
            body: `${name} is live`,
            icon: '/favicon.svg',
          });
          n.onclick = () => {
            window.focus();
            n.close();
          };
        } catch {
          // Notification constructor can throw in some environments
        }
      }

      // Toast (Phase 3)
      toast.success(`${name} is live!`, {
        description: previewUrl || undefined,
        action: previewUrl
          ? { label: 'Open', onClick: () => window.open(previewUrl, '_blank') }
          : undefined,
        duration: 8000,
      });
      return;
    }

    // ── Build/edit error ──
    if (phase === 'error' && wasBuildOrEdit) {
      errorTimestampRef.current = Date.now();
      document.title = 'Build failed \u2014 Ca$ino Builder';
      setFavicon(FAVICON_DEFAULT);

      // Delay error toast to allow P0-25 auto-recovery (editing->error->complete in <2s)
      setTimeout(() => {
        // If phase already moved past error (auto-recovery), suppress the toast
        if (prevPhaseRef.current === 'error') {
          toast.error('Build failed', { duration: 10000 });
        }
      }, 2000);
      return;
    }

    // ── Returned to idle/chatting ──
    if (phase === 'idle' || phase === 'chatting') {
      document.title = DEFAULT_TITLE;
      setFavicon(FAVICON_DEFAULT);
    }
  }, [phase, appName, previewUrl]);

  // ------ Restore title when tab regains focus ------
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && prevPhaseRef.current === 'complete') {
        // Remove the (1) unread indicator but keep "Build ready"
        document.title = 'Build ready \u2014 Ca$ino Builder';
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // ------ Cleanup on unmount ------
  useEffect(() => {
    return () => {
      document.title = DEFAULT_TITLE;
      setFavicon(FAVICON_DEFAULT);
      if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
    };
  }, []);

  // ------ Permission prompt handlers ------
  const dismissPrompt = useCallback(() => {
    setShowPermissionPrompt(false);
    localStorage.setItem(PERMISSION_ASKED_KEY, 'true');
  }, []);

  const acceptPrompt = useCallback(async () => {
    setShowPermissionPrompt(false);
    localStorage.setItem(PERMISSION_ASKED_KEY, 'true');
    if (typeof Notification !== 'undefined') {
      await Notification.requestPermission();
    }
  }, []);

  return { showPermissionPrompt, dismissPrompt, acceptPrompt };
}
