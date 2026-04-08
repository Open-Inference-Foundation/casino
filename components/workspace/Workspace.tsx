'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAgent, useSites, useSiteVersions, useAuth } from '@flowstack/sdk';
import { useCreditStatus } from '@/lib/hooks/useCreditStatus';
import { useAgentBalance } from '@/lib/hooks/useAgentBalance';
import { useWorkspaceState } from '@/lib/hooks/useWorkspaceState';
import { extractBuildUrl } from '@/lib/build-stages';
import HomeView from './HomeView';
import AppSidebar, { AppEntry } from './AppSidebar';
import ChatPanel from './ChatPanel';
import PreviewPanel from './PreviewPanel';
import StatusBar from './StatusBar';
import VersionHistory from './VersionHistory';
import AliasSettings from './AliasSettings';
import PublishToGitHub from './PublishToGitHub';
import CreditBadge from './CreditBadge';
import CreditGateModal from './CreditGateModal';
import WalletSettings from './WalletSettings';

export default function Workspace() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { state, newApp, selectApp, startBuild, enterWorkspace, updateStages, buildComplete, startEdit, promoteComplete, discardDraft } = useWorkspaceState();
  const { sites, refreshSites, deleteSite } = useSites();
  const { versions, liveVersion, isLoading: versionsLoading, promote, deleteVersion, refresh: refreshVersions } = useSiteVersions(state.selectedAppId);
  const [showVersionPanel, setShowVersionPanel] = useState(false);
  const [showCreditGate, setShowCreditGate] = useState(false);
  const [creditGateCost, setCreditGateCost] = useState(60);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'chat' | 'preview'>('chat');
  const { data: creditStatus, refetch: refetchCredits } = useCreditStatus();
  const { data: agentBalance } = useAgentBalance();
  const isTokenUser = !!agentBalance;
  const { query, messages, isStreaming, toolCalls, clearMessages, cancelQuery } = useAgent(
    'data-science',
    { targetAgents: ['site_builder_agent'] },
  );

  // Track edit context to prepend on first message
  const editContextRef = useRef<{ id: string; name: string } | null>(null);
  const isFirstMessageRef = useRef(true);

  // Build timer — tracks elapsed time since build started for stage progression
  const buildStartRef = useRef<number | null>(null);
  const [buildElapsedMs, setBuildElapsedMs] = useState(0);

  useEffect(() => {
    if ((state.phase === 'building' || state.phase === 'editing') && isStreaming) {
      if (!buildStartRef.current) buildStartRef.current = Date.now();
      const interval = setInterval(() => {
        setBuildElapsedMs(Date.now() - (buildStartRef.current ?? Date.now()));
      }, 2000);
      return () => clearInterval(interval);
    }
    if (state.phase !== 'building' && state.phase !== 'editing') {
      buildStartRef.current = null;
      setBuildElapsedMs(0);
    }
  }, [state.phase, isStreaming]);

  // Detect when a new build/edit starts and transition back to 'building' phase.
  // This handles follow-up messages ("make the landing page better") that trigger
  // a rebuild while the phase is still 'complete' from the previous build.
  const prevToolCountRef = useRef(0);
  useEffect(() => {
    if (!isStreaming || toolCalls.length === 0) return;
    const hasBuildTool = toolCalls.some(
      (tc) => tc.name === 'build_site' && tc.status === 'running',
    );
    const hasEditTool = toolCalls.some(
      (tc) => tc.name === 'edit_site' && tc.status === 'running',
    );
    // Only transition to building for build_site — edit_site stays in editing phase
    if (hasBuildTool && state.phase !== 'building') {
      startBuild();
    }
    // If edit_site starts running from a non-editing phase (e.g., follow-up edit from 'complete'),
    // reset to editing with existing preview context
    if (hasEditTool && state.phase !== 'editing' && state.selectedAppId && state.previewUrl) {
      startEdit(state.selectedAppId, state.selectedAppName ?? 'App', state.previewUrl);
    }
  }, [toolCalls, isStreaming, state.phase, state.selectedAppId, state.selectedAppName, state.previewUrl, startBuild, startEdit]);

  // Sync build progress from toolCalls
  useEffect(() => {
    const mapped = toolCalls.map((tc) => ({
      name: tc.name,
      status: tc.status,
      result: tc.result,
      agentResponse: tc.agentResponse,
    }));
    // Always call updateStages during building/editing phase (timer drives progression)
    if (toolCalls.length > 0 || ((state.phase === 'building' || state.phase === 'editing') && buildElapsedMs > 0)) {
      updateStages(mapped, isStreaming, buildElapsedMs);
    }
  }, [toolCalls, isStreaming, updateStages, buildElapsedMs, state.phase]);

  // After streaming ends, refresh sites list + auto-show preview on mobile
  useEffect(() => {
    if (!isStreaming && toolCalls.length > 0) {
      const url = extractBuildUrl(
        toolCalls.map((tc) => ({ name: tc.name, result: tc.result, agentResponse: tc.agentResponse })),
      );
      if (url) {
        refreshSites();
        refreshVersions();
        // On mobile: switch to preview tab automatically when build/edit finishes
        setMobilePanel('preview');
      }
      // Refetch after stream ends to capture post-execution charges (build +59, edit +24)
      refetchCredits();
    }
  }, [isStreaming, toolCalls, refreshSites, refreshVersions, refetchCredits]);

  const handlePromote = useCallback(async (version: number) => {
    const ok = await promote(version);
    if (ok) {
      refreshSites();
      // Force iframe reload to show promoted version
      buildComplete(state.previewUrl ?? '');
    }
    return ok;
  }, [promote, refreshSites, buildComplete, state.previewUrl]);

  const handlePromoteDraft = useCallback(async () => {
    if (!state.draftVersion) return;
    const ok = await promote(state.draftVersion);
    if (ok) {
      promoteComplete();
      refreshSites();
      refreshVersions();
    }
  }, [state.draftVersion, promote, promoteComplete, refreshSites, refreshVersions]);

  const handleDiscardDraft = useCallback(async () => {
    if (!state.draftVersion) return;
    await deleteVersion(state.draftVersion);
    discardDraft();
    refreshVersions();
  }, [state.draftVersion, deleteVersion, discardDraft, refreshVersions]);

  const handleDeleteVersion = useCallback(async (version: number) => {
    return deleteVersion(version);
  }, [deleteVersion]);

  const handleNewApp = useCallback(() => {
    newApp();
    clearMessages();
    editContextRef.current = null;
    isFirstMessageRef.current = true;
    setShowVersionPanel(false);
  }, [newApp, clearMessages]);

  const handleSelectApp = useCallback(
    (app: AppEntry) => {
      const site = sites?.find((s) => s.id === app.id);
      selectApp(app.id, app.name, app.url, site?.liveVersion);
      clearMessages();
      editContextRef.current = null;
      isFirstMessageRef.current = true;
    },
    [selectApp, clearMessages, sites],
  );

  const handleEditApp = useCallback(
    (app: AppEntry) => {
      if (!app.url) return;
      startEdit(app.id, app.name, app.url);
      clearMessages();
      editContextRef.current = { id: app.id, name: app.name };
      isFirstMessageRef.current = true;
    },
    [startEdit, clearMessages],
  );

  const handleDeleteApp = useCallback(
    async (id: string) => {
      await deleteSite(id);
      if (state.selectedAppId === id) {
        newApp();
        clearMessages();
      }
      refreshSites();
    },
    [deleteSite, state.selectedAppId, newApp, clearMessages, refreshSites],
  );

  const handleSend = useCallback(
    async (text: string) => {
      // Credit gate — action-aware: idle=build(60), editing=edit(25), otherwise chat(1)
      if (!isTokenUser && creditStatus) {
        const actionCost = state.phase === 'idle' ? 60
          : state.phase === 'editing' ? 25
          : 1;
        if (creditStatus.remaining < actionCost) {
          setCreditGateCost(actionCost);
          setShowCreditGate(true);
          return;
        }
      }

      let finalText = text;

      if (editContextRef.current) {
        // Edit mode — always include site context
        finalText = `[site_id: ${editContextRef.current.id}, name: "${editContextRef.current.name}"] ${text}`;
      } else if (state.selectedAppId && state.phase !== 'idle') {
        // App selected — always include context so agent knows which app
        finalText = `[site_id: ${state.selectedAppId}, name: "${state.selectedAppName || 'unknown'}"] ${text}`;
      } else if (isFirstMessageRef.current && state.phase === 'idle') {
        startBuild();
        isFirstMessageRef.current = false;
      }

      await query(finalText);
      refetchCredits();
    },
    [state.phase, state.selectedAppId, state.selectedAppName, startBuild, query, creditStatus, isTokenUser, refetchCredits],
  );

  const handleLogout = useCallback(() => {
    logout();
    router.push('/');
  }, [logout, router]);

  // Convert sites to AppEntry[] — prefer subdomain URL when available (versioned sites),
  // fall back to legacy CDN URL for sites not yet migrated
  const apps: AppEntry[] = (sites ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    url: s.subdomainUrl ?? s.url ?? null,
  }));

  // ── IDLE STATE: full-screen home view (Bolt-like) ────────────────────────────
  if (state.phase === 'idle') {
    return (
      <div className="h-screen overflow-hidden">
        <HomeView
          userEmail={user?.email}
          recentApps={apps}
          onSend={handleSend}
          onSelectApp={handleSelectApp}
          onDeleteApp={handleDeleteApp}
          onEditApp={handleEditApp}
          onLogout={handleLogout}
          onViewWorkspace={enterWorkspace}
        />
      </div>
    );
  }

  // ── ACTIVE STATE: 3-panel workspace ─────────────────────────────────────────
  const previewState: 'empty' | 'building' | 'editing' | 'preview' =
    state.phase === 'building'
      ? 'building'
      : state.phase === 'editing' && isStreaming
      ? 'editing'
      : state.previewUrl
      ? 'preview'
      : 'empty';

  const activeStage = state.buildStages.find((s) => s.status === 'active')?.label;

  return (
    <div className="workspace-layout">
      {/* Header */}
      <header className="flex items-center justify-between px-3 md:px-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] gap-2">
        {/* Mobile: hamburger sidebar toggle */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden flex-shrink-0 w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
          title="Apps"
          aria-label="Open apps sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>

        <button
          onClick={handleNewApp}
          className="text-sm font-bold text-[var(--color-text)] tracking-tight hover:text-[var(--color-accent)] transition-colors flex-shrink-0"
          title="Back to home"
        >
          Ca<span className="text-[var(--color-accent)]">$</span>ino
        </button>

        {/* Mobile: Chat / Preview panel toggle */}
        <div className="md:hidden flex items-center rounded-lg border border-[var(--color-border)] overflow-hidden flex-shrink-0">
          <button
            onClick={() => setMobilePanel('chat')}
            className={`text-xs px-2.5 py-1 transition-colors ${
              mobilePanel === 'chat'
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setMobilePanel('preview')}
            className={`text-xs px-2.5 py-1 transition-colors ${
              mobilePanel === 'preview'
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            Preview
          </button>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
          {state.selectedAppName && (
            <span className="hidden sm:block text-sm text-[var(--color-text-secondary)] truncate max-w-[120px] md:max-w-xs">
              {state.phase === 'editing' ? '✏️ ' : ''}{state.selectedAppName}
            </span>
          )}
          {state.selectedAppId && state.phase !== 'building' && (
            <button
              onClick={() => setShowVersionPanel(!showVersionPanel)}
              className={`hidden md:inline-flex text-xs px-2 py-1 rounded-lg border transition-colors ${
                showVersionPanel
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                  : 'border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
              }`}
              title="Version history & settings"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="inline-block mr-1">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6 3v3l2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Versions
            </button>
          )}
          <CreditBadge />
          <button
            onClick={handleNewApp}
            className="text-xs px-2 md:px-2.5 py-1 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors flex-shrink-0"
          >
            + New
          </button>
        </div>
      </header>

      {/* Body: sidebar + chat + preview */}
      <div className="workspace-body overflow-hidden">

        {/* Sidebar — desktop: inline column; mobile: slide-in drawer */}
        {/* Desktop sidebar */}
        <div
          style={{ width: 'var(--sidebar-width)', minWidth: 'var(--sidebar-width)' }}
          className="hidden md:flex h-full flex-shrink-0"
        >
          <AppSidebar
            apps={apps}
            selectedAppId={state.selectedAppId}
            onNewApp={handleNewApp}
            onSelectApp={handleSelectApp}
            onDeleteApp={handleDeleteApp}
            onEditApp={handleEditApp}
          />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <>
            <div
              className="mobile-overlay md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
              aria-hidden="true"
            />
            <div className={`mobile-drawer mobile-drawer--open md:hidden`}>
              <AppSidebar
                apps={apps}
                selectedAppId={state.selectedAppId}
                onNewApp={() => { handleNewApp(); setMobileSidebarOpen(false); }}
                onSelectApp={(app) => { handleSelectApp(app); setMobileSidebarOpen(false); }}
                onDeleteApp={handleDeleteApp}
                onEditApp={(app) => { handleEditApp(app); setMobileSidebarOpen(false); }}
              />
            </div>
          </>
        )}

        {/* Chat panel — full width on mobile when active tab, capped at 50% on desktop */}
        <div
          className={`h-full min-w-0 md:max-w-[50%] ${mobilePanel === 'preview' ? 'hidden md:block' : 'block'}`}
          style={{ flex: '1 1 0%' }}
        >
          <ChatPanel
            messages={messages}
            isStreaming={isStreaming}
            onSend={handleSend}
            onCancel={cancelQuery}
            showDomainPicker={false}
            appName={state.selectedAppName}
            isEditing={state.phase === 'editing'}
          />
        </div>

        {/* Preview panel — full width on mobile when active tab */}
        <div
          className={`h-full min-w-0 flex flex-col ${mobilePanel === 'chat' ? 'hidden md:flex' : 'flex'}`}
          style={{ flex: '1 1 0%' }}
        >
          <PreviewPanel
            state={previewState}
            buildStages={state.buildStages}
            previewUrl={state.previewUrl}
            appName={state.selectedAppName}
            refreshKey={state.previewRefreshKey}
            isPreviewDraft={state.isPreviewDraft}
            draftVersion={state.draftVersion}
            onPromote={handlePromoteDraft}
            onDiscard={handleDiscardDraft}
          />
        </div>

        {/* Version History + Settings panel — desktop only */}
        {showVersionPanel && state.selectedAppId && (
          <div className="hidden md:flex h-full flex-shrink-0" style={{ width: '280px' }}>
            <div className="flex flex-col h-full w-full">
              <VersionHistory
                versions={versions}
                liveVersion={liveVersion}
                isLoading={versionsLoading}
                onPromote={handlePromote}
                onDelete={handleDeleteVersion}
                onClose={() => setShowVersionPanel(false)}
              />
              <AliasSettings
                siteId={state.selectedAppId}
                currentAlias={sites?.find((s) => s.id === state.selectedAppId)?.alias}
                onAliasChanged={() => { refreshSites(); refreshVersions(); }}
              />
              <PublishToGitHub
                siteId={state.selectedAppId}
                siteName={state.selectedAppName ?? 'app'}
                liveVersion={liveVersion}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div style={{ height: 'var(--statusbar-height)' }}>
        <StatusBar
          phase={state.phase}
          currentStage={activeStage}
          previewUrl={state.previewUrl}
          errorMessage={state.errorMessage}
          isEditing={state.phase === 'editing'}
          currentVersion={state.currentVersion ?? liveVersion}
          isPreviewDraft={state.isPreviewDraft}
          draftVersion={state.draftVersion}
        />
      </div>

      {/* Credit gate modal */}
      {showCreditGate && (
        <CreditGateModal
          creditCost={creditGateCost}
          onClose={() => setShowCreditGate(false)}
          onOpenWallet={() => {
            setShowCreditGate(false);
            // CreditBadge handles the wallet settings panel
          }}
        />
      )}
    </div>
  );
}
