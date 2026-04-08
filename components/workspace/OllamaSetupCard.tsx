'use client';

import { useState } from 'react';
import type { OllamaLocalModel } from '@flowstack/sdk';

interface OllamaSetupCardProps {
  available: boolean;
  models: OllamaLocalModel[];
  host: string;
  error: string | null;
  isDetecting: boolean;
  onDetect: (host: string) => void;
  onConnect: (modelName: string, host: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '';
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

export default function OllamaSetupCard({
  available,
  models,
  host,
  error,
  isDetecting,
  onDetect,
  onConnect,
}: OllamaSetupCardProps) {
  const [customHost, setCustomHost] = useState(host);
  const [showCorsTip, setShowCorsTip] = useState(false);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]/50">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${
            isDetecting ? 'bg-yellow-400 animate-pulse' :
            available ? 'bg-green-400' : 'bg-[var(--color-text-tertiary)]'
          }`} />
          <div>
            <p className="text-sm font-medium text-[var(--color-text)]">Local Inference (Ollama)</p>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">
              {isDetecting ? 'Detecting...' :
               available ? `${models.length} model${models.length !== 1 ? 's' : ''} available` :
               'Not detected'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {available && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 font-medium">
              FREE
            </span>
          )}
          <button
            onClick={() => onDetect(customHost)}
            disabled={isDetecting}
            className="text-xs px-2.5 py-1 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-accent)] transition-colors disabled:opacity-50"
          >
            {isDetecting ? '...' : 'Retry'}
          </button>
        </div>
      </div>

      {/* Host URL input */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={customHost}
            onChange={e => setCustomHost(e.target.value)}
            placeholder="http://localhost:11434"
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)]"
          />
          <button
            onClick={() => onDetect(customHost)}
            disabled={isDetecting}
            className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50"
          >
            Detect
          </button>
        </div>

        {/* CORS tip */}
        <button
          onClick={() => setShowCorsTip(!showCorsTip)}
          className="text-[11px] text-[var(--color-accent)] hover:underline"
        >
          {showCorsTip ? 'Hide setup instructions' : 'Not connecting? Setup instructions'}
        </button>
        {showCorsTip && (
          <div className="text-[11px] text-[var(--color-text-tertiary)] bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)]/50 space-y-1.5">
            <p className="font-medium text-[var(--color-text-secondary)]">Enable CORS for browser access:</p>
            <code className="block text-[var(--color-accent)] font-mono text-[10px]">
              OLLAMA_ORIGINS=* ollama serve
            </code>
            <p>Or for remote access, expose via tunnel:</p>
            <code className="block text-[var(--color-accent)] font-mono text-[10px]">
              ngrok http 11434
            </code>
          </div>
        )}

        {/* Error */}
        {error && !available && (
          <p className="text-[11px] text-[var(--color-error,#d44343)]">{error}</p>
        )}

        {/* Models list */}
        {available && models.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider">Available Models</p>
            {models.map(model => (
              <div
                key={model.name}
                className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--color-border)]/50 bg-[var(--color-surface)]"
              >
                <div>
                  <p className="text-xs font-medium text-[var(--color-text)] font-mono">{model.name}</p>
                  {model.size > 0 && (
                    <p className="text-[10px] text-[var(--color-text-tertiary)]">{formatSize(model.size)}</p>
                  )}
                </div>
                <button
                  onClick={() => onConnect(model.name, customHost)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 font-medium transition-colors"
                >
                  Use
                </button>
              </div>
            ))}
          </div>
        )}

        {/* No models */}
        {available && models.length === 0 && (
          <p className="text-xs text-[var(--color-text-tertiary)]">
            Ollama is running but no models are installed. Run{' '}
            <code className="text-[var(--color-accent)] font-mono">ollama pull llama3.2</code>{' '}
            to get started.
          </p>
        )}
      </div>
    </div>
  );
}
