'use client';

import { useState } from 'react';
import { useAuth } from '@flowstack/sdk';
import { useConnections } from '@flowstack/sdk';
import WalletSettingsContent from './WalletSettingsContent';
import ModelSettingsContent from './ModelSettingsContent';
import { useNotificationPreferences } from '@/lib/hooks/useNotificationPreferences';

type Tab = 'wallet' | 'connections' | 'account' | 'notifications' | 'models';

interface BuilderSettingsProps {
  initialTab?: Tab;
  onClose: () => void;
  onLogout?: () => void;
}

const SERVICES = [
  { key: 'github',   label: 'GitHub',  icon: '🐙' },
  { key: 'google',   label: 'Google',  icon: '🔵' },
  { key: 'strava',   label: 'Strava',  icon: '🟠' },
  { key: 'twitter',  label: 'Twitter / X', icon: '🐦' },
  { key: 'reddit',   label: 'Reddit',  icon: '🟥' },
] as const;

type ServiceKey = typeof SERVICES[number]['key'];

/**
 * BuilderSettings — full-page tabbed settings for the Casino builder.
 *
 * Tabs: Wallet (credits + wallet link) · Connections (OAuth services) · Account
 *
 * Renders as a centered modal on desktop and a bottom sheet on mobile,
 * matching the existing PrivacySettings / MobileSettingsSheet pattern.
 */
export default function BuilderSettings({ initialTab = 'wallet', onClose, onLogout }: BuilderSettingsProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const { user } = useAuth();
  const { connections, connect, disconnect, isLoading: connectionsLoading } = useConnections();
  const { soundEnabled, setSoundEnabled, pushPermission, requestPushPermission } = useNotificationPreferences();

  const tabs: { key: Tab; label: string }[] = [
    { key: 'wallet', label: 'Wallet' },
    { key: 'models', label: 'Models' },
    { key: 'connections', label: 'Connections' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'account', label: 'Account' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <h2 className="text-base font-semibold text-[var(--color-text)]">
            Ca<span className="text-[var(--color-accent)]">$</span>ino Settings
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Close settings"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-5 pb-3 flex-shrink-0 border-b border-[var(--color-border)]">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content — scrollable */}
        <div className="overflow-y-auto flex-1 panel-scroll">
          {activeTab === 'wallet' && (
            <WalletSettingsContent onClose={onClose} />
          )}

          {activeTab === 'models' && (
            <ModelSettingsContent />
          )}

          {activeTab === 'connections' && (
            <div className="p-5 space-y-3">
              <p className="text-xs text-[var(--color-text-tertiary)] mb-4">
                Connect your accounts to let Casino agents access your data and services.
              </p>
              {connectionsLoading ? (
                <div className="space-y-3">
                  {SERVICES.map(s => (
                    <div key={s.key} className="h-14 rounded-xl bg-[var(--color-border)]/30 animate-pulse" />
                  ))}
                </div>
              ) : (
                SERVICES.map(svc => {
                  const status = connections?.[svc.key as ServiceKey];
                  const isConnected = status?.connected ?? false;
                  const displayName = isConnected
                    ? ((status as any)?.email ?? (status as any)?.username ?? svc.label)
                    : null;

                  return (
                    <div
                      key={svc.key}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl leading-none">{svc.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text)]">{svc.label}</p>
                          {displayName && (
                            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 truncate max-w-[180px]">
                              {displayName}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => isConnected ? disconnect(svc.key) : connect(svc.key)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          isConnected
                            ? 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[#d44343] hover:text-[#d44343]'
                            : 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]'
                        }`}
                      >
                        {isConnected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-5 space-y-4">
              <p className="text-xs text-[var(--color-text-tertiary)] mb-2">
                Control how Casino notifies you when builds complete.
              </p>

              {/* Browser push notifications */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/30">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">Browser notifications</p>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                    {pushPermission === 'granted'
                      ? 'Enabled — you\'ll be notified when builds finish'
                      : pushPermission === 'denied'
                        ? 'Blocked — change in browser settings'
                        : 'Get notified even when this tab is in the background'}
                  </p>
                </div>
                {pushPermission === 'granted' ? (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)] font-medium">
                    Enabled
                  </span>
                ) : pushPermission === 'denied' ? (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-text-tertiary)]/10 text-[var(--color-text-tertiary)] font-medium">
                    Blocked
                  </span>
                ) : (
                  <button
                    onClick={requestPushPermission}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] font-medium transition-colors"
                  >
                    Enable
                  </button>
                )}
              </div>

              {/* Completion sound */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/30">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">Completion sound</p>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Play a chime when builds finish</p>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative w-10 h-[22px] rounded-full transition-colors ${
                    soundEnabled ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'
                  }`}
                >
                  <span
                    className={`absolute top-[3px] w-4 h-4 rounded-full bg-white transition-transform ${
                      soundEnabled ? 'left-[22px]' : 'left-[3px]'
                    }`}
                  />
                </button>
              </div>

              {/* Email — coming soon */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/30 opacity-50">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">Email notifications</p>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Get emailed when builds finish</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-border)]/30 text-[var(--color-text-tertiary)] font-medium">
                  Coming soon
                </span>
              </div>

              {/* SMS — premium */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/30 opacity-50">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">SMS notifications</p>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Text message on build completion</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium">
                  Premium
                </span>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="p-5">
              <div className="space-y-4">
                {/* Account details */}
                <div className="space-y-3">
                  {user?.email && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Email</span>
                      <span className="text-sm text-[var(--color-text)] font-mono break-all">{user.email}</span>
                    </div>
                  )}
                  {user?.id && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">User ID</span>
                      <span className="text-xs text-[var(--color-text-secondary)] font-mono break-all">{user.id}</span>
                    </div>
                  )}
                  {user?.tenantId && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Tenant</span>
                      <span className="text-xs text-[var(--color-text-secondary)] font-mono break-all">{user.tenantId}</span>
                    </div>
                  )}
                </div>

                {/* Sign out */}
                <div className="border-t border-[var(--color-border)] pt-4">
                  <button
                    onClick={() => {
                      onClose();
                      onLogout?.();
                    }}
                    className="w-full py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:border-[#d44343] hover:text-[#d44343] transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
