'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProviderCredentials, useOllamaDetection, useFlowstack, flowstackFetch } from '@flowstack/sdk';
import type { LLMProvider, ProviderCredential } from '@flowstack/sdk';
import OllamaSetupCard from './OllamaSetupCard';

const PROVIDER_LABELS: Record<LLMProvider, { label: string; icon: string }> = {
  anthropic: { label: 'Anthropic', icon: 'A' },
  openai: { label: 'OpenAI', icon: 'O' },
  gemini: { label: 'Google Gemini', icon: 'G' },
  deepseek: { label: 'DeepSeek', icon: 'D' },
  ollama: { label: 'Ollama (Local)', icon: 'L' },
};

const CLOUD_PROVIDERS: LLMProvider[] = ['anthropic', 'openai', 'gemini', 'deepseek'];

interface AddFormState {
  provider: LLMProvider;
  api_key: string;
  model_id: string;
  purpose: string;
}

export default function ModelSettingsContent() {
  const { credentials, createCredential, deleteCredential, isLoading, error } = useProviderCredentials();
  const ollama = useOllamaDetection();
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<AddFormState>({
    provider: 'anthropic',
    api_key: '',
    model_id: '',
    purpose: 'llm',
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [routingPref, setRoutingPref] = useState('cloud_first');
  const { credentials: authCredentials, config } = useFlowstack();
  const clientConfig = { baseUrl: config.baseUrl, tenantId: config.tenantId };

  // Load routing preference
  useEffect(() => {
    if (!authCredentials) return;
    flowstackFetch<{ preference: string }>(
      '/api/v1/user/provider-credentials/routing-preference',
      { credentials: authCredentials },
      clientConfig,
    ).then(res => {
      if (res.ok && res.data) setRoutingPref(res.data.preference);
    }).catch(() => {});
  }, [authCredentials]);

  const handleRoutingChange = useCallback(async (pref: string) => {
    if (!authCredentials) return;
    setRoutingPref(pref);
    try {
      await flowstackFetch(
        '/api/v1/user/provider-credentials/routing-preference',
        { method: 'PUT', credentials: authCredentials, body: { preference: pref } },
        clientConfig,
      );
    } catch {
      // Revert on failure
      setRoutingPref(routingPref);
    }
  }, [authCredentials, routingPref]);

  const handleConnectOllama = async (modelName: string, host: string) => {
    try {
      setAddError(null);
      await createCredential({
        provider: 'ollama',
        host,
        model_id: modelName,
        purpose: 'llm',
        is_default: true,
      });
    } catch (err: any) {
      setAddError(err.message);
    }
  };

  const handleAddCredential = async () => {
    setAddLoading(true);
    setAddError(null);
    try {
      await createCredential({
        provider: addForm.provider,
        api_key: addForm.api_key || undefined,
        model_id: addForm.model_id || undefined,
        purpose: addForm.purpose,
        is_default: true,
      });
      setShowAddForm(false);
      setAddForm({ provider: 'anthropic', api_key: '', model_id: '', purpose: 'llm' });
    } catch (err: any) {
      setAddError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (credId: string) => {
    setDeleteLoading(credId);
    try {
      await deleteCredential(credId);
    } catch (err: any) {
      setAddError(err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="p-5 space-y-5">
      {/* Ollama section */}
      <OllamaSetupCard
        available={ollama.available}
        models={ollama.models}
        host={ollama.host}
        error={ollama.error}
        isDetecting={ollama.isDetecting}
        onDetect={(host) => ollama.detect(host)}
        onConnect={handleConnectOllama}
      />

      {/* Routing preference */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-text)]">Routing Preference</p>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
              Controls when local models are used vs cloud providers
            </p>
          </div>
          <select
            value={routingPref}
            onChange={e => handleRoutingChange(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
          >
            <option value="cloud_first">Cloud First</option>
            <option value="local_first">Local First</option>
            <option value="local_only">Local Only</option>
            <option value="cloud_only">Cloud Only</option>
          </select>
        </div>
      </div>

      {/* Configured credentials */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
            Provider Credentials
          </p>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs px-2.5 py-1 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            {showAddForm ? 'Cancel' : '+ Add'}
          </button>
        </div>

        {/* Error display */}
        {(error || addError) && (
          <p className="text-[11px] text-[var(--color-error,#d44343)] mb-3">
            {error || addError}
          </p>
        )}

        {/* Add credential form */}
        {showAddForm && (
          <div className="p-4 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-surface-alt)]/30 space-y-3 mb-3">
            {/* Provider select */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] block mb-1">Provider</label>
              <select
                value={addForm.provider}
                onChange={e => setAddForm(f => ({ ...f, provider: e.target.value as LLMProvider }))}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
              >
                {CLOUD_PROVIDERS.map(p => (
                  <option key={p} value={p}>{PROVIDER_LABELS[p].label}</option>
                ))}
              </select>
            </div>

            {/* API Key */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] block mb-1">API Key</label>
              <input
                type="password"
                value={addForm.api_key}
                onChange={e => setAddForm(f => ({ ...f, api_key: e.target.value }))}
                placeholder="sk-..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            {/* Model ID (optional) */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] block mb-1">Model (optional)</label>
              <input
                type="text"
                value={addForm.model_id}
                onChange={e => setAddForm(f => ({ ...f, model_id: e.target.value }))}
                placeholder="Uses provider default"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            {/* Purpose select */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] block mb-1">Purpose</label>
              <select
                value={addForm.purpose}
                onChange={e => setAddForm(f => ({ ...f, purpose: e.target.value }))}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
              >
                <option value="llm">Orchestrator (default)</option>
                <option value="thinking">Thinking / Planning</option>
                <option value="code_sandbox">Code Executor</option>
                <option value="data_operations">Data Operations</option>
                <option value="visualization">Visualization</option>
                <option value="site_builder">Site Builder</option>
              </select>
            </div>

            <button
              onClick={handleAddCredential}
              disabled={addLoading || !addForm.api_key}
              className="w-full py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-medium hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50"
            >
              {addLoading ? 'Saving...' : 'Save Credential'}
            </button>
          </div>
        )}

        {/* Credentials list */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-14 rounded-xl bg-[var(--color-border)]/30 animate-pulse" />
            ))}
          </div>
        ) : credentials.length === 0 ? (
          <p className="text-xs text-[var(--color-text-tertiary)] py-4 text-center">
            No credentials configured. Add your API keys to use your own models.
          </p>
        ) : (
          <div className="space-y-2">
            {credentials.map(cred => (
              <div
                key={cred.credential_id}
                className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    cred.provider === 'ollama'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                  }`}>
                    {PROVIDER_LABELS[cred.provider as LLMProvider]?.icon || '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium text-[var(--color-text)] truncate">
                        {PROVIDER_LABELS[cred.provider as LLMProvider]?.label || cred.provider}
                      </p>
                      {cred.is_default && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium shrink-0">
                          default
                        </span>
                      )}
                      {cred.provider === 'ollama' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 font-medium shrink-0">
                          local
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] font-mono truncate">
                      {cred.model_id} · {cred.purpose}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(cred.credential_id)}
                  disabled={deleteLoading === cred.credential_id}
                  className="text-[11px] px-2 py-1 rounded-lg border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:border-[#d44343] hover:text-[#d44343] transition-colors disabled:opacity-50 shrink-0 ml-2"
                >
                  {deleteLoading === cred.credential_id ? '...' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
