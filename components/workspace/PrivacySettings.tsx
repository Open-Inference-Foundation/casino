'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFlowstack, getPiiSettings, updatePiiSettings } from '@flowstack/sdk';

interface PrivacySettingsProps {
  onClose: () => void;
}

// Entity types that are always masked (non-toggleable)
const ALWAYS_ON_ENTITIES = [
  { key: 'US_SSN', label: 'Social Security numbers' },
  { key: 'CREDIT_CARD', label: 'Credit card numbers' },
  { key: 'US_BANK_NUMBER', label: 'Bank account numbers' },
  { key: 'IBAN_CODE', label: 'IBAN codes' },
  { key: 'US_PASSPORT', label: 'Passport numbers' },
  { key: 'US_DRIVER_LICENSE', label: 'Driver license numbers' },
];

// Configurable entity types with user-friendly labels
const CONFIGURABLE_ENTITIES = [
  { key: 'LOCATION', label: 'Locations & addresses', defaultOn: false },
  { key: 'PERSON', label: 'Names', defaultOn: false },
  { key: 'DATE_TIME', label: 'Dates & times', defaultOn: false },
  { key: 'PHONE_NUMBER', label: 'Phone numbers', defaultOn: false },
  { key: 'EMAIL_ADDRESS', label: 'Email addresses', defaultOn: true },
  { key: 'IP_ADDRESS', label: 'IP addresses', defaultOn: true },
  { key: 'NRP', label: 'Nationality / religion / political', defaultOn: true },
  { key: 'URL', label: 'URLs', defaultOn: false },
];

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-8 h-[18px] rounded-full transition-colors flex-shrink-0 ${
        disabled
          ? 'bg-[var(--color-border)] cursor-not-allowed opacity-50'
          : checked
          ? 'bg-[var(--color-accent)]'
          : 'bg-[var(--color-border)]'
      }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform ${
          checked ? 'translate-x-[14px]' : ''
        }`}
      />
    </button>
  );
}

export default function PrivacySettings({ onClose }: PrivacySettingsProps) {
  const { credentials, config, selectedWorkspace } = useFlowstack();
  const workspaceId = selectedWorkspace?.workspaceId;
  const clientConfig = { baseUrl: config.baseUrl, tenantId: config.tenantId };

  const [masterEnabled, setMasterEnabled] = useState(true);
  const [entityTypes, setEntityTypes] = useState<Record<string, boolean>>({});
  const [fileMaskingEnabled, setFileMaskingEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load settings on mount
  useEffect(() => {
    if (!credentials || !workspaceId) return;
    setIsLoading(true);
    getPiiSettings(credentials, workspaceId, clientConfig)
      .then((res) => {
        if (res.ok && res.data?.settings) {
          const qm = res.data.settings.query_masking;
          setMasterEnabled(qm?.enabled ?? true);
          setEntityTypes(qm?.entity_types ?? {});
          setFileMaskingEnabled(res.data.settings.file_masking?.enabled ?? true);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, credentials?.apiKey]);

  const saveSettings = useCallback(
    (enabled: boolean, entities: Record<string, boolean>) => {
      if (!credentials || !workspaceId) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updatePiiSettings(
          credentials,
          workspaceId,
          { query_masking: { enabled, entity_types: entities } },
          clientConfig,
        ).catch(() => {});
      }, 500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [credentials, workspaceId],
  );

  const handleMasterToggle = (val: boolean) => {
    setMasterEnabled(val);
    saveSettings(val, entityTypes);
  };

  const handleEntityToggle = (key: string, val: boolean) => {
    const next = { ...entityTypes, [key]: val };
    setEntityTypes(next);
    saveSettings(masterEnabled, next);
  };

  const handleFileMaskingToggle = (val: boolean) => {
    setFileMaskingEnabled(val);
    if (!credentials || !workspaceId) return;
    if (fileDebounceRef.current) clearTimeout(fileDebounceRef.current);
    fileDebounceRef.current = setTimeout(() => {
      updatePiiSettings(
        credentials,
        workspaceId,
        { file_masking: { enabled: val } },
        clientConfig,
      ).catch(() => {});
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[var(--color-accent)]">
              <path d="M7 1.5a2.5 2.5 0 00-2.5 2.5V6h5V4A2.5 2.5 0 007 1.5z" stroke="currentColor" strokeWidth="1.2" />
              <rect x="3" y="6" width="8" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="7" cy="9.5" r="1" fill="currentColor" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Privacy & Masking</h3>
              <p className="text-[10px] text-[var(--color-text-tertiary)]">
                Applies to all your Ca$ino queries & apps you build
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-3 space-y-3 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <p className="text-xs text-[var(--color-text-tertiary)] py-4 text-center">Loading settings...</p>
          ) : (
            <>
              {/* Master toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[var(--color-text)]">Query masking</span>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">
                    Redact sensitive data before it reaches the AI
                  </p>
                </div>
                <Toggle checked={masterEnabled} onChange={handleMasterToggle} />
              </div>

              {masterEnabled && (
                <>
                  {/* Always-on section */}
                  <div className="rounded-lg bg-[var(--color-surface-alt)]/50 p-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0">
                        <rect x="2" y="4" width="6" height="5" rx="1" stroke="var(--color-text-tertiary)" strokeWidth="1" />
                        <path d="M3.5 4V3a1.5 1.5 0 013 0v1" stroke="var(--color-text-tertiary)" strokeWidth="1" />
                      </svg>
                      <span className="text-[10px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                        Always protected
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] leading-relaxed">
                      {ALWAYS_ON_ENTITIES.map((e) => e.label).join(', ')}
                    </p>
                  </div>

                  {/* Configurable toggles */}
                  <div className="space-y-0.5">
                    {CONFIGURABLE_ENTITIES.map((entity) => (
                      <div key={entity.key} className="flex items-center justify-between py-1.5">
                        <span className="text-xs text-[var(--color-text-secondary)]">{entity.label}</span>
                        <Toggle
                          checked={entityTypes[entity.key] ?? entity.defaultOn}
                          onChange={(val) => handleEntityToggle(entity.key, val)}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {!masterEnabled && (
                <p className="text-[10px] text-[var(--color-text-tertiary)] italic py-2">
                  Query masking disabled. Financial data (SSN, credit cards) is still always protected.
                </p>
              )}

              {/* File masking toggle (P0-33) */}
              <div className="pt-2 border-t border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[var(--color-text-secondary)]">File & document masking</span>
                    <p className="text-[10px] text-[var(--color-text-tertiary)]">
                      Scan uploaded CSV/Excel files for PII before processing
                    </p>
                  </div>
                  <Toggle checked={fileMaskingEnabled} onChange={handleFileMaskingToggle} />
                </div>
                {!fileMaskingEnabled && (
                  <p className="text-[10px] text-amber-500 mt-1">
                    Uploaded files will be sent to the AI without PII redaction. Financial data in chat text is still always protected.
                  </p>
                )}
              </div>

              {/* Scope explanation */}
              <div className="pt-2 border-t border-[var(--color-border)]">
                <p className="text-[10px] text-[var(--color-text-tertiary)] leading-relaxed">
                  These settings apply to your Casino account. Apps you build inherit your masking preferences — their end users&apos; queries are filtered using these rules.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
