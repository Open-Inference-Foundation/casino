'use client';

import MermaidDiagram from '../MermaidDiagram';

interface DiagramCardProps {
  mermaidCode: string;
}

const MERMAID_REGEX = /```mermaid\n([\s\S]*?)```/;

export function extractMermaidCode(text: string): string | null {
  const match = text.match(MERMAID_REGEX);
  return match ? match[1].trim() : null;
}

export default function DiagramCard({ mermaidCode }: DiagramCardProps) {
  return (
    <div className="mt-3 rounded-lg border border-[var(--color-border)] overflow-hidden">
      <div className="px-3 py-1.5 bg-[var(--color-surface)] border-b border-[var(--color-border)] text-[10px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
        Diagram
      </div>
      <div className="p-2">
        <MermaidDiagram code={mermaidCode} />
      </div>
    </div>
  );
}
