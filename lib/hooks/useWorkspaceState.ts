import { useReducer, useCallback } from 'react';
import {
  getInitialStages,
  getInitialEditStages,
  deriveStages,
  deriveEditStages,
  extractBuildUrl,
  extractEditResult,
  isEditToolCall,
  BuildStage,
} from '@/lib/build-stages';

export type WorkspacePhase = 'idle' | 'building' | 'complete' | 'editing' | 'error';

/** Convert any site URL to the clean subdomain format. */
function toSubdomainUrl(url: string): string {
  // Match legacy: .../sites/{site_id}/index.html
  const legacyMatch = url.match(/\/sites\/([a-f0-9]{12})\/index\.html/);
  if (legacyMatch) return `https://${legacyMatch[1]}.casino.flowstack.fun`;
  // Already subdomain format or other — return as-is
  return url;
}

export interface WorkspaceState {
  phase: WorkspacePhase;
  selectedAppId: string | null;
  selectedAppName: string | null;
  previewUrl: string | null;
  buildStages: BuildStage[];
  errorMessage: string | null;
  /** Increments each time a build/edit completes — forces iframe reload. */
  previewRefreshKey: number;
  /** Current version number (from latest build/edit). */
  currentVersion: number | null;
  /** True when the preview shows a draft version that is not yet live. */
  isPreviewDraft: boolean;
  /** Version number of the draft being previewed (for promote/discard). */
  draftVersion: number | null;
}

type ToolCallLike = { name: string; status: string; result?: unknown; agentResponse?: string };

type Action =
  | { type: 'NEW_APP' }
  | { type: 'SELECT_APP'; id: string; name: string; url: string | null; version?: number }
  | { type: 'START_BUILD' }
  | { type: 'ENTER_WORKSPACE' }
  | { type: 'UPDATE_STAGES'; toolCalls: ToolCallLike[]; isStreaming: boolean; buildElapsedMs?: number }
  | { type: 'BUILD_COMPLETE'; url: string; version?: number }
  | { type: 'START_EDIT'; id: string; name: string; url: string }
  | { type: 'PROMOTE_COMPLETE' }
  | { type: 'DISCARD_DRAFT' }
  | { type: 'ERROR'; message: string };

function reducer(state: WorkspaceState, action: Action): WorkspaceState {
  switch (action.type) {
    case 'NEW_APP':
      return {
        ...state,
        phase: 'idle',
        selectedAppId: null,
        selectedAppName: null,
        previewUrl: null,
        buildStages: getInitialStages(),
        errorMessage: null,
        currentVersion: null,
        isPreviewDraft: false,
        draftVersion: null,
      };
    case 'SELECT_APP':
      return {
        ...state,
        phase: 'complete',
        selectedAppId: action.id,
        selectedAppName: action.name,
        previewUrl: action.url ? toSubdomainUrl(action.url) : null,
        buildStages: getInitialStages(),
        errorMessage: null,
        currentVersion: action.version ?? null,
        isPreviewDraft: false,
        draftVersion: null,
      };
    case 'START_BUILD':
      return {
        ...state,
        phase: 'building',
        buildStages: getInitialStages(),
        errorMessage: null,
        isPreviewDraft: false,
        draftVersion: null,
      };
    case 'ENTER_WORKSPACE':
      return {
        ...state,
        phase: 'complete',
        previewUrl: null,
        buildStages: getInitialStages(),
        errorMessage: null,
      };
    case 'UPDATE_STAGES': {
      const isEdit = isEditToolCall(action.toolCalls);
      const stages = isEdit
        ? deriveEditStages(action.toolCalls, action.isStreaming, action.buildElapsedMs)
        : deriveStages(action.toolCalls, action.isStreaming, action.buildElapsedMs);
      const url = extractBuildUrl(action.toolCalls);

      // Build complete — URL found during build phase
      if (url && state.phase === 'building') {
        return {
          ...state,
          phase: 'complete',
          buildStages: stages,
          previewUrl: toSubdomainUrl(url),
          previewRefreshKey: state.previewRefreshKey + 1,
        };
      }

      // Edit complete — check for draft preview URL from edit_site result
      if (state.phase === 'editing') {
        const editDone = action.toolCalls.some(
          (tc) => tc.name === 'edit_site' && (tc.status === 'complete' || tc.status === 'success'),
        );
        if (editDone) {
          const editResult = extractEditResult(action.toolCalls);
          if (editResult) {
            // Draft mode: show versioned preview URL, mark as draft
            return {
              ...state,
              phase: 'complete',
              buildStages: stages,
              previewUrl: editResult.previewUrl,
              previewRefreshKey: state.previewRefreshKey + 1,
              isPreviewDraft: true,
              draftVersion: editResult.version,
            };
          }
          // Fallback: no preview_url (backward compat with old backend)
          return {
            ...state,
            phase: 'complete',
            buildStages: stages,
            previewUrl: url ? toSubdomainUrl(url) : state.previewUrl,
            previewRefreshKey: state.previewRefreshKey + 1,
            isPreviewDraft: false,
            draftVersion: null,
          };
        }
        if (url) {
          return {
            ...state,
            phase: 'complete',
            buildStages: stages,
            previewUrl: toSubdomainUrl(url),
            previewRefreshKey: state.previewRefreshKey + 1,
            isPreviewDraft: false,
            draftVersion: null,
          };
        }
      }

      return { ...state, buildStages: stages };
    }
    case 'BUILD_COMPLETE':
      return { ...state, phase: 'complete', previewUrl: toSubdomainUrl(action.url), currentVersion: action.version ?? state.currentVersion };
    case 'START_EDIT':
      return {
        ...state,
        phase: 'editing',
        selectedAppId: action.id,
        selectedAppName: action.name,
        previewUrl: toSubdomainUrl(action.url),
        buildStages: getInitialEditStages(),
        errorMessage: null,
        isPreviewDraft: false,
        draftVersion: null,
      };
    case 'PROMOTE_COMPLETE':
      return {
        ...state,
        previewUrl: state.selectedAppId
          ? `https://${state.selectedAppId}.casino.flowstack.fun`
          : state.previewUrl,
        isPreviewDraft: false,
        draftVersion: null,
        previewRefreshKey: state.previewRefreshKey + 1,
      };
    case 'DISCARD_DRAFT':
      return {
        ...state,
        previewUrl: state.selectedAppId
          ? `https://${state.selectedAppId}.casino.flowstack.fun`
          : null,
        isPreviewDraft: false,
        draftVersion: null,
        previewRefreshKey: state.previewRefreshKey + 1,
      };
    case 'ERROR':
      return { ...state, phase: 'error', errorMessage: action.message };
    default:
      return state;
  }
}

const initial: WorkspaceState = {
  phase: 'idle',
  selectedAppId: null,
  selectedAppName: null,
  previewUrl: null,
  buildStages: getInitialStages(),
  errorMessage: null,
  previewRefreshKey: 0,
  currentVersion: null,
  isPreviewDraft: false,
  draftVersion: null,
};

export function useWorkspaceState() {
  const [state, dispatch] = useReducer(reducer, initial);

  const newApp = useCallback(() => dispatch({ type: 'NEW_APP' }), []);
  const selectApp = useCallback(
    (id: string, name: string, url: string | null, version?: number) => dispatch({ type: 'SELECT_APP', id, name, url, version }),
    [],
  );
  const startBuild = useCallback(() => dispatch({ type: 'START_BUILD' }), []);
  const enterWorkspace = useCallback(() => dispatch({ type: 'ENTER_WORKSPACE' }), []);
  const updateStages = useCallback(
    (toolCalls: ToolCallLike[], isStreaming: boolean, buildElapsedMs?: number) =>
      dispatch({ type: 'UPDATE_STAGES', toolCalls, isStreaming, buildElapsedMs }),
    [],
  );
  const buildComplete = useCallback((url: string) => dispatch({ type: 'BUILD_COMPLETE', url }), []);
  const startEdit = useCallback(
    (id: string, name: string, url: string) => dispatch({ type: 'START_EDIT', id, name, url }),
    [],
  );
  const setError = useCallback((message: string) => dispatch({ type: 'ERROR', message }), []);
  const promoteComplete = useCallback(() => dispatch({ type: 'PROMOTE_COMPLETE' }), []);
  const discardDraft = useCallback(() => dispatch({ type: 'DISCARD_DRAFT' }), []);

  return { state, newApp, selectApp, startBuild, enterWorkspace, updateStages, buildComplete, startEdit, setError, promoteComplete, discardDraft };
}
